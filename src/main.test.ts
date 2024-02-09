import { test, expect } from "vitest";
import {
    tailwindColorObjectToDartClass,
    tailwindFontSizeObjectToDartClass,
    tailwindSpacingObjectToDartClass,
} from "./main";

test("tailwindColorObjectToDartClass()", () => {
    const result = tailwindColorObjectToDartClass(
        {
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
  Colors();
  /// #FFFFFF
  static const white = Color(0xFFFFFFFF);
  /// #000000
  static const black = Color(0xFF000000);
  static _ColorsFeedback get feedback => _ColorsFeedback();
}

class _ColorsFeedback {
  _ColorsFeedback();
  /// #FF5733
  final error = Color(0xFFFF5733);
  /// #33FFAC
  final success = Color(0xFF33FFAC);
  /// #FFB600
  final warn = Color(0xFFFFB600);
  _ColorsFeedbackNeutral get neutral => _ColorsFeedbackNeutral();
}

class _ColorsFeedbackNeutral {
  _ColorsFeedbackNeutral();
  /// #555555
  final shade50 = Color(0xFF555555);
  /// #000000
  final dark = Color(0xFF000000);
  /// #FFFFFF
  final light = Color(0xFFFFFFFF);
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
  TwFontSizes();
  /// fontSize: 8px
  static const double sm = 8;
  /// fontSize: 16px
  static const double md = 16;
  /// fontSize: 24px
  static const double lg = 24;
  static _TwFontSizesUtils get utils => _TwFontSizesUtils();
}

class _TwFontSizesUtils {
  _TwFontSizesUtils();
  /// fontSize: 192px
  final double header = 192;
  /// fontSize: 150px
  final double header2 = 150;
}`);
});

test("tailwindSpacingObjectToDartClass()", () => {
    const result = tailwindSpacingObjectToDartClass(
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
    expect(result.content).toBe(`class Space {
  Space();
  /// size: 1px
  static const double size1 = 1;
  /// size: 2px
  static const double size2 = 2;
  /// size: 1.5px
  static const double size1Point5 = 1.5;
  static _SpaceUtils get utils => _SpaceUtils();
}

class _SpaceUtils {
  _SpaceUtils();
  /// size: 100px
  final double lg = 100;
  /// size: 150px
  final double xl = 150;
}`);
});
