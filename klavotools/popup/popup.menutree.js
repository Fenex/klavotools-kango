angular.module('popup.menutree', [])
.factory('MenuTree', function() {
    return [
        {
            title: 'Профиль',
            path: '/u/',
            sub: [
                {
                    title: 'Сводка',
                    path: '/u/'
                },
                {
                    title: 'Статистика',
                    path: '/u/#/__USERID__/stats/'
                },
                {
                    title: 'Достижения',
                    path: '/u/#/__USERID__/achievements/',
                },
                {
                    title: 'Гараж',
                    path: '/u/#/__USERID__/car/'
                },
                {
                    title: 'Бортжурнал',
                    path: '/u/#/__USERID__/journal/'
                },
                {
                    title: 'Лента друзей',
                    path: '/u/#/__USERID__/friends/feed/'
                },
                {
                    title: 'Почта',
                    path: '/u/#/__USERID__/messages/contacts/'
                },
                {
                    title: 'Настройки',
                    path: '/u/#/__USERID__/prefs/'
                }
            ]
        },
        {
            title: 'Игра',
            path: '/gamelist/',
            sub: [
                {
                    title: 'Главная',
                    path: '/'
                },
                {
                    title: 'Создать заезд',
                    path: '/create/'
                },
                {
                    title: 'Выбрать заезд',
                    path: '/gamelist/'
                },
                {
                    title: 'Случайный заезд',
                    path: '/go/'
                }
            ]
        },
        {
            title: 'Рекорды',
            path: '/top/',
            sub: [
                {
                    title: 'Рейтинг',
                    path: '/top/'
                },
                {
                    title: 'Рекорды за день',
                    path: '/top/day/normal/'
                },
                {
                    title: 'Рекорды за неделю',
                    path: '/top/week/normal/'
                },
                {
                    title: 'Успехи',
                    path: '/top/success/'
                }
            ]
        },
        {
            title: 'Словари',
            path: '/vocs/top/',
            sub: [
                {
                    title: 'Все',
                    path: '/vocs/top/'
                },
                {
                    title: 'Используемые',
                    path: '/vocs/search?section=favs&type=&order=&changed=section&searchtext='
                },
                {
                    title: 'Мои',
                    path: '/vocs/search?section=my&type=all&order=&changed=section&searchtext='
                },
                {
                    title: 'Добавить словарь',
                    path: '/vocs/add/'
                }
            ]
        },
        {
            title: 'Форум',
            path: '/forum/',
            sub: [
                {
                    title: 'Новости',
                    path: '/forum/news/'
                },
                {
                    title: 'Общий',
                    path: '/forum/general/'
                },
                {
                    title: 'События',
                    path: '/forum/events/'
                },
                {
                    title: 'Академия',
                    path: '/forum/academy/'
                },
                {
                    title: 'Техцентр',
                    path: '/forum/problems/'
                },
                {
                    title: 'Пит-Стоп',
                    path: '/forum/flood/'
                },
                {
                    title: 'Лента сообщений',
                    path: '/forum/feed/'
                },
            ]
        },
        {
            title: 'Настройки',
            path: '__EXTENSION_OPTIONS__',
            color: 'green',
            hidden: true
        },
        {
            title: 'F1',
            path: '__EXTENSION__KG/help.html',
            color: 'green',
            hidden: true
        }
    ];
})
