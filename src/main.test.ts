import { test, expect } from "vitest";
import {
    rgbStringToDartColor,
    rgbaStringToDartColor,
    sizeInputToDouble,
    tailwindColorObjectToDartClass,
    tailwindFontSizeObjectToDartClass,
    tailwindSizeValueObjectToDartClass,
} from "./main";

test("tailwindColorObjectToDartClass()", () => {
    const result = tailwindColorObjectToDartClass(
        {
            whiteAbbr: "#FFF",
            white: "#FFFFFF",
            black: "#000000",
            feedback: {
                error: "#FF5733",
                success: "#33FFAC",
                warn: "#FFB600",
                neutral: {
                    dark: "#000000",
                    light: "#FFFFFF",
                    50: "#555555",
                },
            },
        },
        {
            instancePath: "",
            classPrefix: "",
            remValue: 16,
        },
    );
    expect(result.content).toBe(`class Colors {
  const Colors();
  /// #FFF
  static const whiteAbbr = Color(0xFFFFFFFF);
  /// #FFFFFF
  static const white = Color(0xFFFFFFFF);
  /// #000000
  static const black = Color(0xFF000000);
  static const feedback = _ColorsFeedback();
}

class _ColorsFeedback {
  const _ColorsFeedback();
  /// #FF5733
  final error = const Color(0xFFFF5733);
  /// #33FFAC
  final success = const Color(0xFF33FFAC);
  /// #FFB600
  final warn = const Color(0xFFFFB600);
  final neutral = const _ColorsFeedbackNeutral();
}

class _ColorsFeedbackNeutral {
  const _ColorsFeedbackNeutral();
  /// #555555
  final shade50 = const Color(0xFF555555);
  /// #000000
  final shadeDark = const Color(0xFF000000);
  /// #FFFFFF
  final shadeLight = const Color(0xFFFFFFFF);
}`);
});

test("tailwindFontSizeObjectToDartClass()", () => {
    const remValue = 16;
    const result = tailwindFontSizeObjectToDartClass(
        {
            sm: "0.5rem",
            md: "1rem",
            lg: "1.5rem",
            utils: {
                header: "192px",
                header2: "150px",
            },
        },
        {
            classPrefix: "Tw",
            instancePath: "",
            remValue,
        },
    );
    expect(result.content).toBe(`class TwFontSizes {
  const TwFontSizes();
  /// fontSize: 8px
  static const double sm = 8;
  /// fontSize: 16px
  static const double md = 16;
  /// fontSize: 24px
  static const double lg = 24;
  static const _TwFontSizesUtils utils = _TwFontSizesUtils();
}

class _TwFontSizesUtils {
  const _TwFontSizesUtils();
  /// fontSize: 192px
  final double header = 192;
  /// fontSize: 150px
  final double header2 = 150;
}`);
});

test("tailwindSpacingObjectToDartClass()", () => {
    const result = tailwindSizeValueObjectToDartClass(
        "Spacing",
        "size",
        "spacing",
        {
            1: "1px",
            "1.5": "1.5px",
            2: "2px",
            utils: {
                lg: "100px",
                xl: "150px",
            },
        },
        {
            instancePath: "",
            remValue: 16,
            classPrefix: "",
        },
    );
    expect(result.content).toBe(`class Spacing {
  const Spacing();
  /// spacing: 1
  static const double size1 = 1;
  /// spacing: 2
  static const double size2 = 2;
  /// spacing: 1.5
  static const double size1Point5 = 1.5;
  static const utils = _SpacingUtils();
}

class _SpacingUtils {
  const _SpacingUtils();
  /// spacing: 100
  final double lg = 100;
  /// spacing: 150
  final double xl = 150;
}`);
});

test("rgbStringToDartColor()", () => {
    const result = rgbStringToDartColor("rgb(1,2,3)");
    expect(result).toBe(`Color.fromRGBO(1, 2, 3, 1)`);
    const result2 = rgbStringToDartColor("rgb(1 2 3)");
    expect(result2).toBe(`Color.fromRGBO(1, 2, 3, 1)`);
});

test("rgbaStringToDartColor()", () => {
    const result = rgbaStringToDartColor("rgba(1,2,3,0.5)");
    expect(result).toBe("Color.fromRGBO(1, 2, 3, 0.5)");
    const result2 = rgbaStringToDartColor("rgba(1 2 3 0.5");
    expect(result2).toBe(`Color.fromRGBO(1, 2, 3, 0.5)`);
});

test("sizeInputToDouble()", () => {
    const inputs: Record<string, number> = {
        "1.5px": 1.5,
        "10px": 10,
        "1rem": 16,
        "2rem": 32,
        "0.5em": 8,
        "0.25em": 4,
    };
    for (const key of Object.keys(inputs)) {
        const result = sizeInputToDouble(key, 16);
        expect(result).toBe(inputs[key]);
    }
});
