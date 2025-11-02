import localFont from "next/font/local"

export const fontText = localFont({
    variable: "--font-text",
    src: [
        {
            path: "./text/NeueHaasGrotText-55Roman-Trial.otf",
            weight: "400",
            style: "normal"
        },
        {
            path: "./text/NeueHaasGrotText-56Italic-Trial.otf",
            weight: "400",
            style: "italic"
        },
        {
            path: "./text/NeueHaasGrotText-65Medium-Trial.otf",
            weight: "500",
            style: "normal"
        },
        {
            path: "./text/NeueHaasGrotText-66MediumItalic-Trial.otf",
            weight: "500",
            style: "italic"
        },
        {
            path: "./text/NeueHaasGrotText-75Bold-Trial.otf",
            weight: "700",
            style: "normal"
        },
        {
            path: "./text/NeueHaasGrotText-76BoldItalic-Trial.otf",
            weight: "700",
            style: "italic"
        }
    ]
})

export const fontDisplay = localFont({
    variable: "--font-display",
    src: [
        {
            path: "./display/NeueHaasGrotDisp-15XXThin-Trial.otf",
            weight: "100",
            style: "normal"
        },
        {
            path: "./display/NeueHaasGrotDisp-16XXThinItalic-Trial.otf",
            weight: "100",
            style: "italic"
        },
        {
            path: "./display/NeueHaasGrotDisp-25XThin-Trial.otf",
            weight: "200",
            style: "normal"
        },
        {
            path: "./display/NeueHaasGrotDisp-26XThinItalic-Trial.otf",
            weight: "200",
            style: "italic"
        },
        {
            path: "./display/NeueHaasGrotDisp-35Thin-Trial.otf",
            weight: "300",
            style: "normal"
        },
        {
            path: "./display/NeueHaasGrotDisp-36ThinItalic-Trial.otf",
            weight: "300",
            style: "italic"
        },
        {
            path: "./display/NeueHaasGrotDisp-45Light-Trial.otf",
            weight: "350",
            style: "normal"
        },
        {
            path: "./display/NeueHaasGrotDisp-46LightItalic-Trial.otf",
            weight: "350",
            style: "italic"
        },
        {
            path: "./display/NeueHaasGrotDisp-55Roman-Trial.otf",
            weight: "400",
            style: "normal"
        },
        {
            path: "./display/NeueHaasGrotDisp-56Italic-Trial.otf",
            weight: "400",
            style: "italic"
        },
        {
            path: "./display/NeueHaasGrotDisp-65Medium-Trial.otf",
            weight: "500",
            style: "normal"
        },
        {
            path: "./display/NeueHaasGrotDisp-66MediumItalic-Trial.otf",
            weight: "500",
            style: "italic"
        },
        {
            path: "./display/NeueHaasGrotDisp-75Bold-Trial.otf",
            weight: "700",
            style: "normal"
        },
        {
            path: "./display/NeueHaasGrotDisp-76BoldItalic-Trial.otf",
            weight: "700",
            style: "italic"
        },
        {
            path: "./display/NeueHaasGrotDisp-95Black-Trial.otf",
            weight: "900",
            style: "normal"
        },
        {
            path: "./display/NeueHaasGrotDisp-96BlackItalic-Trial.otf",
            weight: "900",
            style: "italic"
        }
    ]
})