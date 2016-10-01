from doit.tools import run_once
from urllib import urlretrieve
from zipfile import ZipFile
from tempfile import mkstemp, mkdtemp
from subprocess import Popen, PIPE
from shutil import rmtree, copytree, move, ignore_patterns
from os import path, close, remove, listdir, makedirs

KANGO_ARCHIVE_URL = 'http://kangoextensions.com/kango/kango-framework-latest.zip'
KANGO_DIR = 'kango'
KANGO_BIN = path.abspath(path.join(KANGO_DIR, 'kango.py'))
BUILD_DIR = 'build'
BUILD_IGNORE = (
    '.*',
    '*.py',
    '*.pyc',
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

def bootstrapProject(kango, buildDir):
    pipe = Popen(['python', kango, 'create'], stdout=PIPE, stdin=PIPE, cwd=buildDir)
    pipe.communicate('TemporaryProject\0')

def prepareProjectFiles(targetDir, ignore=()):
    """Replaces targetDir directory contents with project files for building"""
    removeDirectory(targetDir) # Clean the existing target directory first
    copytree('.', targetDir, ignore=ignore_patterns(*ignore))

def buildProject(kango, targetDir, outputDir):
    pipe = Popen(['python', kango, 'build', '.'], cwd=targetDir)
    pipe.communicate(None)

def moveFiles(srcDir, destDir):
    """Moves files from srcDir to destDir. Replaces existing files"""
    files = listdir(srcDir)
    if not path.exists(destDir):
        makedirs(destDir)
    for fileName in files:
        pathName = path.join(srcDir, fileName)
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
        'actions': [(bootstrapProject, [KANGO_BIN, tempDir])],
        'task_dep': ['installKangoFramework'],
    }
    yield {
        'name': 'prepare',
        'actions': [(prepareProjectFiles, [targetDir, BUILD_IGNORE])],
        'task_dep': ['buildExtension:bootstrap'],
    }
    yield {
        'name': 'build',
        'actions': [(buildProject, [KANGO_BIN, tempDir, outputDir])],
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
