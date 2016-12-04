klavotools-kango
================

[![Build Status](https://api.travis-ci.org/Fenex/klavotools-kango.svg?branch=master)](https://travis-ci.org/Fenex/klavotools-kango)

Кроссбраузерное расширение для сайта [www.klavogonki.ru](http://www.klavogonki.ru)

Сборка проекта
-------------------

Для сборки необходимо:

1. Установить Python 2.7 (http://www.python.org/download/).
2. Установить модуль [doit](https://pypi.python.org/pypi/doit): `pip install doit==0.29.0`
3. Установить модуль [libsass](https://pypi.python.org/pypi/libsass): `pip install libsass`
4. Выполнить в корневой директории проекта команду: `doit`

Если все пройдет успешно, то появится директория `build` с готовыми к установке архивами расширений.

Userstyles
----------
Стили располагаются в директории `/res/skins/`. Здесь стили - обычный css файл (в отличии от реализации в `KTS-1`), где каждое правило должно заканчиваться на `!important`. В противном случае некоторые правила могут не примениться к странице.
Если требуется подключать изображения, то они складываются рядом, в папку с таким же названием как css-файл. В самом файле действуют макроподстановки:

    background-image: url(%FOLDER_pink%/logo.png) important!;
    
`%FOLDER_pink%` [заменится](https://github.com/Fenex/klavotools-kango/blob/v3.1.0/klavotools/foreground/userstyle.js#L20) на валидный URI, по которому будет находиться изображение. Концовка `pink` - указание из какой папки брать файл.

При добавлении нового стиля необходимо так же прописать его название в подключаемом файле: `/klavotools/background/content-style.js`

Userscripts
-----------

Юзерскрипты располагаются в [этом](https://github.com/voidmain02/KgScripts) репозитории.
