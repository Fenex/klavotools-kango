klavotools-kango
================

Кроссбраузерное расширение для сайта Клавогонки.ру

Сборка проекта
-------------------

1. Устанавливаем Python 2.7 (http://www.python.org/download/)
2. Создаём где-нибудь папку `kango`, в ней папки `framework` и `klavotools`.
3. Загружаем [отсюда](http://kangoextensions.com/kango/kango-framework-latest.zip) архив и распаковываем его в созданную папку `framework`. В папке `framework` должен находиться файл `kango.py`.
4. Отрываем шелл, переходим в созданную на шаге 2 папку `klavotools`.
5. Создаём проект: `call "../framework/kango.py" create`. Называем его `klavotools`. Если всё прошло успешно, в папке `klavotools` должны быть две папки: `src` и `certificates`.
6. Распаковываем репозиторий `klavotools-kango` в директорию: `%kangodir%/klavotools/src/common/` с заменой всех файлов.
7. Создаём пакетный файл `build.cmd` в директории `%kangodir%/klavotools/` со содержимым, описанным разделом ниже.
8. Запускаем файл `build.cmd`. Если всё пройдёт успешно, то появится директория `output`, в ней готовые к установке архивы расширений.

build.cmd
---------

    @echo off
    set kts=%~d0%~p0
    call "%kts%\..\framework\kango.py" build .\
