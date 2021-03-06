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
KANGO_ARCHIVE_URL = 'http://web.archive.org/web/20160623024659/kangoextensions.com/kango/kango-framework-latest.zip'
KANGO_DIR = 'kango'
KANGO_BIN = path.abspath(path.join(KANGO_DIR, 'kango.py'))
BUILD_DIR = 'build'
UNPACKED_DIR = 'unpacked'
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
    'requirements.txt'
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
def fixManifest(srcDir):
    with open('extension_info.json') as extensionInfoData:
        extensionInfo = json.load(extensionInfoData)
    with open(path.join(srcDir, 'chrome', 'manifest.json')) as data:
        manifest = json.load(data)
    contentScriptsField = [{
        'matches': [CONTENTSCRIPTS_MATCHES],
        'js': extensionInfo['content_scripts'],
        'css': extensionInfo['content_styles'],
        'run_at': 'document_start',
    }]
    manifest['content_scripts'] = contentScriptsField
    manifest['web_accessible_resources'] = extensionInfo['content_styles']
    manifest['permissions'] = extensionInfo['permissionsWebExtension']
    manifest['options_ui'] = {
        'page': extensionInfo['options_page'],
        'open_in_tab': True,
    }
    with open(path.join(srcDir, 'chrome', 'manifest.json'), 'w') as outfile:
        json.dump(manifest, outfile, indent=2)

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
        # copy packed extension (now it's only xpi for firefox)
        if path.isfile(pathName) and fileName.find('_' + WEBEXTENSION_SUFFIX + '_') != -1:
            move(pathName, path.join(destDir, fileName))
        # copy unpacked extension (for debugging)
        if path.isdir(pathName) and fileName == 'chrome':
            unpackedDir = path.join(destDir, UNPACKED_DIR)
            if path.exists(unpackedDir):
                rmtree(unpackedDir)
            move(pathName, unpackedDir)

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
        'name': 'fixManifest',
        'actions': [(fixManifest, [outputDir])],
        'task_dep': ['buildExtension:build'],
    }
    yield {
        'name': 'buildWebExtension',
        'actions': [(buildWebExtension, [outputDir, certDir])],
        'task_dep': ['buildExtension:fixManifest']
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
