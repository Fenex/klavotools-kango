from doit.tools import run_once
from urllib import urlretrieve
from zipfile import ZipFile
from tempfile import mkstemp, mkdtemp
from array import array
from subprocess import Popen, PIPE
from shutil import rmtree, copytree, move, ignore_patterns
from os import path, close, remove, rename, listdir, walk, makedirs
import sass
import json
import struct

WEBEXTENSION_ID = 'klavotools-kango@klavogonki.ru'
WEBEXTENSION_SUFFIX = 'we'
CONTENTSCRIPTS_MATCHES = '*://*.klavogonki.ru/*'
KANGO_ARCHIVE_URL = 'http://kangoextensions.com/kango/kango-framework-latest.zip'
KANGO_DIR = 'kango'
KANGO_BIN = path.abspath(path.join(KANGO_DIR, 'kango.py'))
BUILD_DIR = 'build'
BOOTSTRAP_DIR = path.abspath(path.join(BUILD_DIR, 'bootstrap'))
BUILD_IGNORE = (
    '.*',
    '*.py',
    '*.pyc',
    '*.scss',
    'kango',
    'build',
    'package.json',
    'node_modules',
    'tests',
)

def installKango(url, targetDir):
    handle, tempName = mkstemp('.zip')
    urlretrieve(url, tempName)
    archive = ZipFile(tempName)
    archive.extractall(targetDir)
    archive.close()
    close(handle)
    remove(tempName)

def bootstrapProject(kango, bootstrapDir):
    createDirIfNotExists(bootstrapDir)
    pipe = Popen(['python', kango, 'create'], stdout=PIPE, stdin=PIPE, cwd=bootstrapDir)
    pipe.communicate('TemporaryProject\0')

def compileSass(srcDir, destDir):
    sass.compile(dirname=(srcDir, destDir), output_style='compressed')

def buildProject(kango, targetDir):
    pipe = Popen(['python', kango, 'build', '.', '--target=chrome', '--no-pack'],
        stdout=PIPE, cwd=targetDir)
    pipe.communicate(None)

# TODO: somehow to rewrite this crutch
def fixContentScripts(srcDir):
    with open('extension_info.json') as extensionInfoData:
        extensionInfo = json.load(extensionInfoData)
    with open(path.join(srcDir, 'chrome', 'manifest.json')) as data:
        manifest = json.load(data)
    contentScriptsField = [{
        'matches': [CONTENTSCRIPTS_MATCHES],
        'js': extensionInfo['content_scripts'],
        'run_at': 'document_start',
    }]
    manifest['content_scripts'] = contentScriptsField
    with open(path.join(srcDir, 'chrome', 'manifest.json'), 'w') as outfile:
        json.dump(manifest, outfile, indent=2)

def generateSignature(zipPath, keyPath):
    signature = Popen(['openssl', 'sha1', '-sign', keyPath, zipPath],
        stdin=PIPE, stdout=PIPE, stderr=PIPE).communicate()[0]
    derkey = Popen(['openssl', 'rsa', '-pubout', '-inform', 'PEM',
        '-outform', 'DER', '-in', keyPath], stdin=PIPE, stdout=PIPE,
        stderr=PIPE).communicate()[0]
    return signature, derkey

def buildWebExtension(srcDir, certDir):
    chromeExtensionDir = path.join(srcDir, 'chrome')
    manifestPath = path.join(chromeExtensionDir, 'manifest.json')
    with open(manifestPath) as data:
        manifest = json.load(data)
    manifest['applications'] = { 'gecko': { 'id': WEBEXTENSION_ID } }
    with open(manifestPath, 'w') as outfile:
        json.dump(manifest, outfile, indent=2)
    name = manifest['name'].lower().replace(' ', '')
    name += '_' + WEBEXTENSION_SUFFIX + '_' + manifest['version']
    archivePath = path.join(srcDir, name + '.xpi')
    archive = ZipFile(archivePath, 'w')
    for root, dirs, files in walk(chromeExtensionDir):
        for fileName in files:
            archive.write(path.join(root, fileName),
                path.join(path.relpath(root, chromeExtensionDir), fileName))
    archive.close()
    signature, derkey = generateSignature(archivePath,
        path.join(certDir, 'chrome.pem'))
    with open(path.join(srcDir, name + '.crx'), 'wb') as crx:
        crx.write('Cr24')
        header = array('L') if struct.calcsize('L') == 4 else array('I')
        header.append(2)
        header.append(len(derkey))
        header.append(len(signature))
        header.tofile(crx)
        crx.write(derkey)
        crx.write(signature)
        with open(archivePath, 'rb') as zipFile:
            crx.write(zipFile.read())

def createDirIfNotExists(targetDir):
    if not path.exists(targetDir):
        makedirs(targetDir)

def copyFiles(srcDir, destDir, ignore=()):
    copytree(srcDir, destDir, ignore=ignore_patterns(*ignore))

def moveFiles(srcDir, destDir):
    """Moves files from srcDir to destDir. Replaces existing files"""
    files = listdir(srcDir)
    createDirIfNotExists(destDir)
    for fileName in files:
        pathName = path.join(srcDir, fileName)
        if path.isfile(pathName) and fileName.find('_' + WEBEXTENSION_SUFFIX + '_') != -1:
            move(pathName, path.join(destDir, fileName))

def removeDirectory(targetDir):
    rmtree(targetDir)

def task_buildExtension():
    """Builds the extension in the temporary directory."""
    tempDir = mkdtemp()
    targetDir = path.join(tempDir, 'src', 'common')
    outputDir = path.join(tempDir, 'output')
    certDir = path.join(tempDir, 'certificates')
    yield {
        'name': 'bootstrap',
        'actions': [(bootstrapProject, [KANGO_BIN, BOOTSTRAP_DIR])],
        'task_dep': ['installKangoFramework'],
        'targets': [path.join(BOOTSTRAP_DIR, 'src', 'common', 'extension_info.json')],
        'uptodate': [run_once],
    }
    yield {
        'name': 'prepare',
        'actions': [(removeDirectory, [tempDir]),
                    (copyFiles, [BOOTSTRAP_DIR, tempDir]),
                    (removeDirectory, [targetDir]),
                    (copyFiles, ['.', targetDir, BUILD_IGNORE]),
                    (compileSass, ['.', targetDir])],
        'task_dep': ['buildExtension:bootstrap'],
    }
    yield {
        'name': 'build',
        'actions': [(buildProject, [KANGO_BIN, tempDir])],
        'task_dep': ['buildExtension:prepare'],
    }
    yield {
        'name': 'fixContentScripts',
        'actions': [(fixContentScripts, [outputDir])],
        'task_dep': ['buildExtension:build'],
    }
    yield {
        'name': 'buildWebExtension',
        'actions': [(buildWebExtension, [outputDir, certDir])],
        'task_dep': ['buildExtension:fixContentScripts']
    }
    yield {
        'name': 'move',
        'actions': [(moveFiles, [outputDir, BUILD_DIR])],
        'task_dep': ['buildExtension:buildWebExtension'],
    }
    yield {
        'name': 'cleanup',
        'actions': [(removeDirectory, [tempDir])],
        'task_dep': ['buildExtension:move'],
    }

def task_installKangoFramework():
    """Downloads and unpacks the Kango framework."""
    return {
        'actions': [(installKango, [KANGO_ARCHIVE_URL, KANGO_DIR])],
        'targets': [KANGO_BIN],
        'uptodate': [run_once],
    }
