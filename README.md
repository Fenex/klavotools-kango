klavotools-kango
================

Кроссбраузерное расширение для сайта Клавогонки.ру

Сборка проекта
-------------------

###Инструкция
1. Устанавливаем Python 2.7 (http://www.python.org/download/).
2. Создаём где-нибудь папку `kango`, в ней папки `framework` и `klavotools`.
3. Загружаем [отсюда](http://kangoextensions.com/kango/kango-1.7.3-public.zip) архив и распаковываем его в созданную папку `framework`. В папке `framework` должен находиться файл `kango.py`.
4. Открываем шелл, переходим в созданную на шаге 2 папку `klavotools`.
5. Создаём проект: `call "../framework/kango.py" create`. Называем его `klavotools`. Если всё прошло успешно, в папке `klavotools` должны быть две папки: `src` и `certificates`.
6. Клонируем репозиторий `klavotools-kango` в директорию: `%kangodir%/klavotools/src/common/`.
7. Создаём пакетный файл `build.cmd` в директории `%kangodir%/klavotools/` со содержимым, описанным разделом ниже.
8. Запускаем файл `build.cmd`. Если всё пройдёт успешно, то появится директория `output`, в ней готовые к установке архивы расширений.

###build.cmd

    @echo off
    set kts=%~d0%~p0
    call "%kts%\..\framework\kango.py" build .\

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
