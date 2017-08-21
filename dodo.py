from doit.tools import run_once
from urllib import urlretrieve
from zipfile import ZipFile
from tempfile import mkstemp, mkdtemp
from subprocess import Popen, PIPE
from shutil import rmtree, copytree, move, ignore_patterns
from os import path, close, remove, listdir, walk, makedirs
import sass
import json

WEBEXTENSION_ID = 'klavotools-kango@klavogonki.ru'
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
    pipe = Popen(['python', kango, 'build', '.'], cwd=targetDir)
    pipe.communicate(None)

def buildWebExtension(srcDir, destDir):
    with open(path.join(srcDir, 'manifest.json')) as data:
        manifest = json.load(data)
    name = manifest['name'].lower().replace(' ', '') + '_we_' + manifest['version'] + '.xpi'
    manifest['applications'] = { 'gecko': { 'id': WEBEXTENSION_ID } }
    with open(path.join(srcDir, 'manifest.json'), 'w') as outfile:
        json.dump(manifest, outfile, indent=2)
    createDirIfNotExists(destDir)
    archive = ZipFile(path.join(destDir, name), 'w')
    for root, dirs, files in walk(srcDir):
        for fileName in files:
            archive.write(path.join(root, fileName), path.join(path.relpath(root, srcDir), fileName))
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
        if fileName == 'chrome':
            buildWebExtension(pathName, destDir)
            continue
        if path.isfile(pathName):
            move(pathName, path.join(destDir, fileName))

def removeDirectory(targetDir):
    rmtree(targetDir)

def task_buildExtension():
    """Builds the extension in the temporary directory."""
    tempDir = mkdtemp()
    targetDir = path.join(tempDir, 'src', 'common')
    outputDir = path.join(tempDir, 'output')
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
        'name': 'move',
        'actions': [(moveFiles, [outputDir, BUILD_DIR])],
        'task_dep': ['buildExtension:build'],
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
