$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$typeDefinition = @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

public static class GenChatIconBuilder
{
    public static void Generate(string outputDir)
    {
        Directory.CreateDirectory(outputDir);

        using (var master = DrawIcon(512))
        {
            foreach (var size in new[] { 16, 32, 48, 128 })
            {
                using (var resized = new Bitmap(size, size))
                using (var g = Graphics.FromImage(resized))
                {
                    g.SmoothingMode = SmoothingMode.AntiAlias;
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.CompositingQuality = CompositingQuality.HighQuality;
                    g.Clear(Color.Transparent);
                    g.DrawImage(master, 0, 0, size, size);
                    resized.Save(Path.Combine(outputDir, "icon-" + size + ".png"), ImageFormat.Png);
                }
            }
        }
    }

    private static Bitmap DrawIcon(int size)
    {
        var bitmap = new Bitmap(size, size);
        using (var graphics = Graphics.FromImage(bitmap))
        {
            graphics.SmoothingMode = SmoothingMode.AntiAlias;
            graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
            graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
            graphics.CompositingQuality = CompositingQuality.HighQuality;
            graphics.Clear(Color.Transparent);

            var s = size / 512f;

            using (var rounded = RoundedRect(12f * s, 12f * s, 488f * s, 488f * s, 108f * s))
            using (var backgroundBrush = new LinearGradientBrush(
                new PointF(0, 0),
                new PointF(size, size),
                Color.FromArgb(255, 11, 14, 26),
                Color.FromArgb(255, 31, 35, 52)))
            {
                graphics.FillPath(backgroundBrush, rounded);

                using (var glowBrush = new SolidBrush(Color.FromArgb(80, 13, 233, 255)))
                {
                    graphics.FillEllipse(glowBrush, 116f * s, 136f * s, 280f * s, 252f * s);
                }

                var leftEar = new[]
                {
                    new PointF(128f * s, 188f * s),
                    new PointF(170f * s, 58f * s),
                    new PointF(222f * s, 174f * s),
                };
                var rightEar = new[]
                {
                    new PointF(384f * s, 188f * s),
                    new PointF(342f * s, 58f * s),
                    new PointF(290f * s, 174f * s),
                };

                using (var earBrush = new LinearGradientBrush(
                    new PointF(160f * s, 64f * s),
                    new PointF(352f * s, 196f * s),
                    Color.FromArgb(255, 240, 36, 246),
                    Color.FromArgb(255, 106, 82, 184)))
                using (var earStroke = new Pen(Color.FromArgb(255, 79, 46, 126), 8f * s))
                {
                    earStroke.LineJoin = LineJoin.Round;
                    graphics.FillPolygon(earBrush, leftEar);
                    graphics.FillPolygon(earBrush, rightEar);
                    graphics.DrawPolygon(earStroke, leftEar);
                    graphics.DrawPolygon(earStroke, rightEar);
                }

                using (var innerEarBrush = new SolidBrush(Color.FromArgb(255, 65, 42, 91)))
                {
                    graphics.FillPolygon(innerEarBrush, new[]
                    {
                        new PointF(154f * s, 164f * s),
                        new PointF(174f * s, 96f * s),
                        new PointF(198f * s, 154f * s),
                    });
                    graphics.FillPolygon(innerEarBrush, new[]
                    {
                        new PointF(358f * s, 164f * s),
                        new PointF(338f * s, 96f * s),
                        new PointF(314f * s, 154f * s),
                    });
                }

                using (var helmetBandPen = new Pen(Color.FromArgb(255, 237, 240, 249), 22f * s))
                {
                    helmetBandPen.StartCap = LineCap.Round;
                    helmetBandPen.EndCap = LineCap.Round;
                    graphics.DrawArc(helmetBandPen, 120f * s, 52f * s, 272f * s, 244f * s, 205, 130);
                }

                using (var earCupBrush = new LinearGradientBrush(
                    new PointF(90f * s, 180f * s),
                    new PointF(422f * s, 282f * s),
                    Color.FromArgb(255, 170, 70, 224),
                    Color.FromArgb(255, 238, 81, 246)))
                {
                    graphics.FillEllipse(earCupBrush, 84f * s, 188f * s, 58f * s, 88f * s);
                    graphics.FillEllipse(earCupBrush, 370f * s, 188f * s, 58f * s, 88f * s);
                }

                using (var helmetBrush = new LinearGradientBrush(
                    new PointF(96f * s, 132f * s),
                    new PointF(416f * s, 448f * s),
                    Color.FromArgb(255, 238, 240, 246),
                    Color.FromArgb(255, 120, 126, 153)))
                {
                    graphics.FillEllipse(helmetBrush, 96f * s, 124f * s, 320f * s, 308f * s);
                }

                using (var faceBrush = new LinearGradientBrush(
                    new PointF(148f * s, 148f * s),
                    new PointF(360f * s, 384f * s),
                    Color.FromArgb(255, 20, 33, 66),
                    Color.FromArgb(255, 6, 18, 43)))
                {
                    graphics.FillEllipse(faceBrush, 128f * s, 136f * s, 256f * s, 248f * s);
                }

                using (var faceOutline = new Pen(Color.FromArgb(170, 71, 241, 255), 6f * s))
                {
                    graphics.DrawEllipse(faceOutline, 128f * s, 136f * s, 256f * s, 248f * s);
                }

                using (var tealBrush = new SolidBrush(Color.FromArgb(255, 66, 240, 255)))
                using (var tealStroke = new Pen(Color.FromArgb(255, 28, 196, 215), 5f * s))
                {
                    tealStroke.LineJoin = LineJoin.Round;

                    var leftEye = new[]
                    {
                        new PointF(174f * s, 258f * s),
                        new PointF(232f * s, 214f * s),
                        new PointF(270f * s, 224f * s),
                        new PointF(242f * s, 296f * s),
                        new PointF(188f * s, 290f * s),
                    };
                    var rightEye = new[]
                    {
                        new PointF(338f * s, 258f * s),
                        new PointF(280f * s, 214f * s),
                        new PointF(242f * s, 224f * s),
                        new PointF(270f * s, 296f * s),
                        new PointF(324f * s, 290f * s),
                    };
                    graphics.FillPolygon(tealBrush, leftEye);
                    graphics.FillPolygon(tealBrush, rightEye);
                    graphics.DrawPolygon(tealStroke, leftEye);
                    graphics.DrawPolygon(tealStroke, rightEye);

                    graphics.DrawLines(tealStroke, new[]
                    {
                        new PointF(256f * s, 176f * s),
                        new PointF(226f * s, 226f * s),
                        new PointF(244f * s, 226f * s),
                        new PointF(256f * s, 204f * s),
                        new PointF(268f * s, 226f * s),
                        new PointF(286f * s, 226f * s),
                    });

                    graphics.FillEllipse(tealBrush, 246f * s, 288f * s, 20f * s, 16f * s);

                    using (var mouthPen = new Pen(Color.FromArgb(255, 66, 240, 255), 8f * s))
                    {
                        mouthPen.StartCap = LineCap.Round;
                        mouthPen.EndCap = LineCap.Round;
                        graphics.DrawArc(mouthPen, 212f * s, 290f * s, 48f * s, 44f * s, 18, 128);
                        graphics.DrawArc(mouthPen, 252f * s, 290f * s, 48f * s, 44f * s, 34, 128);
                    }
                }

                using (var outlinePen = new Pen(Color.FromArgb(100, 255, 255, 255), 3f * s))
                {
                    graphics.DrawPath(outlinePen, rounded);
                }
            }
        }

        return bitmap;
    }

    private static GraphicsPath RoundedRect(float x, float y, float width, float height, float radius)
    {
        var diameter = radius * 2f;
        var path = new GraphicsPath();
        path.AddArc(x, y, diameter, diameter, 180, 90);
        path.AddArc(x + width - diameter, y, diameter, diameter, 270, 90);
        path.AddArc(x + width - diameter, y + height - diameter, diameter, diameter, 0, 90);
        path.AddArc(x, y + height - diameter, diameter, diameter, 90, 90);
        path.CloseFigure();
        return path;
    }
}
'@

Add-Type -TypeDefinition $typeDefinition -ReferencedAssemblies System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $root "apps\extension\public\icons"

[GenChatIconBuilder]::Generate($outputDir)

Write-Host "Generated extension icons in $outputDir"
