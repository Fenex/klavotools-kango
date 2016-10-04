angular.module('popup.menutree', [])
.factory('MenuTree', function() {
    return [
        {
            title: 'Профиль',
            path: '/u/',
            sub: [
                {
                    title: 'Сводка',
                    path: '/u/',
                    icon: 'icons/context_summary.png',
                },
                {
                    title: 'Статистика',
                    path: '/u/#/__USERID__/stats/',
                    icon: 'icons/context_statistics.png',
                },
                {
                    title: 'Лента друзей',
                    path: '/u/#/__USERID__/friends/feed/',
                    icon: 'icons/context_friends.png',
                },
                {
                    title: 'Бортжурнал',
                    path: '/u/#/__USERID__/journal/',
                    icon: 'icons/context_logbook.png',
                },
                {
                    title: 'Сообщения',
                    path: '/u/#/__USERID__/messages/contacts/',
                    icon: 'icons/context_messages.png',
                },
                {
                    title: 'Достижения',
                    path: '/u/#/__USERID__/achievements/',
                    icon: 'icons/context_achievements.png',
                },
                {
                    title: 'Гараж',
                    path: '/u/#/__USERID__/car/',
                    icon: 'icons/context_garage.png',
                },
                {
                    title: 'Настройки',
                    path: '/u/#/__USERID__/prefs/',
                    icon: 'icons/context_settings.png',
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
    ];
})
