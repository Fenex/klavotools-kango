klavotools-kango
================

Кроссбраузерное расширение для сайта Клавогонки.ру

Сборка проекта
-------------------

###Инструкция
1. Устанавливаем Python 2.7 (http://www.python.org/download/).
2. Создаём где-нибудь папку `kango`, в ней папки `framework` и `klavotools`.
3. Загружаем [отсюда](http://kangoextensions.com/kango/kango-framework-latest.zip) архив и распаковываем его в созданную папку `framework`. В папке `framework` должен находиться файл `kango.py`.
4. Отркываем шелл, переходим в созданную на шаге 2 папку `klavotools`.
5. Создаём проект: `call "../framework/kango.py" create`. Называем его `klavotools`. Если всё прошло успешно, в папке `klavotools` должны быть две папки: `src` и `certificates`.
6. Кланируем репозиторий `klavotools-kango` в директорию: `%kangodir%/klavotools/src/common/`.
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
    
`%FOLDER_pink%` замениться на валидный URI, по которому будет находиться изображение. Концовка `pink` - указание из какой папки брать файл.

При добавлении нового стиля необходимо так же прописать его название в конфигурационном файле: `/klavotools/background/config.js`

Userscripts
-----------

Юзерскрипты располагаются в директории `/klavotools/userjs/`.

При добавлении юзерскриптов надо учитывать:
* Метаданные желательно (но необязательно) оставлять.
* В метаданных к версии приписывать префикс "KTS-2", во избежании каких-либо путаниц, потому что скрипты не смогут быть запущены вне этого расширения (без минимальных переделок).
* Все юзерскрипты загружаются предварительно вызовом функции `UserJS.addScript`, которую надо вызывать в каждом userscript-файле.

По факту, все userscript-файлы здесь - это один вызов этой функции, которая добавляет данные(код, его название и набор правил для инжектинга) в массив.

    UserJS.addScript(
        (string) name, 
        (array of RegExp) rules,
        (function) execute
    );

`name` - уникальное имя для этого юзерскрипта. Это имя надо также прописать:
* в конфигурационном файле `/klavotools/background/config.js`
* в блоке метаданных foreground-скрипта: `/res/klavotools/foreground/userjs-exec.js` строчками ниже, чем идёт подключение файла `userjs-config.js`.

`rules` - массив RegExp-правил для проверки URL-адреса страницы. Для старта запуска скрипта необходимо чтобы подошло хотя бы одно правило из массива.

Весь код юзерскрипта надо помещать в функцию `execute`: `function() { /* userjs code here */ }`.

Следует обратить внимание на то, что во всех юзерскриптах KTS-1 необходимо было делать проверку на недопущение повторного запуска. Сейчас этой проблемы нет, поэтому мусор желательно удаять. Пример такой заплатки виден [здесь](https://github.com/Fenex/KTS/blob/32cc3a687121b210997d7016bca50468e5da0b04/userjs/BigTextArea.user.js#L31-L34). Здесь лишние первый `if` (но не его содержимое), а также выделенные строки.


