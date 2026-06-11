import {
    MapPinned,
    Bell,
    MessageCircleMore,
    SquareCheckBig,
} from "lucide-react";

export const MENU_LIST = [
    {
        title: "여행",
        href: "/history-trip",
        icon: MapPinned,
    },
    {
        title: "공지사항",
        href: "/notice",
        icon: Bell,
    },
    {
        title: "한줄대화",
        href: "/board",
        icon: MessageCircleMore,
    },
    {
        title: "투표",
        href: "/vote",
        icon: SquareCheckBig,
        showCount: true,
    },
];