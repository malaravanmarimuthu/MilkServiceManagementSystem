
using System.Globalization;
using System.Text.Json;
using System.Web;

namespace Common.Extension;

public static class StringExtensions
{
    private static JsonSerializerOptions jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public static bool IsNullOrEmpty(this string value)
    {
        return string.IsNullOrEmpty(value) && string.IsNullOrWhiteSpace(value);
    }

    public static bool IsNotNullOrEmpty(this string value)
    {
        return !value.IsNullOrEmpty();
    }

    public static bool IsEqual(this string value, string compareString)
    {
        return string.Equals(value, compareString, StringComparison.OrdinalIgnoreCase);
    }

    public static bool HasEqual(this string value, params string[] compareStrings)
    {
        return compareStrings.Any(s => s.IsEqual(value));
    }

    public static string ToUrlDecode(this string value)
    {
        if (value == null)
            return string.Empty;
        return HttpUtility.UrlDecode(value);
    }

    public static string ToDateString(this DateTime value)
    {
        return value.ToString("yyyy-MM-dd");
    }

    public static string ToDateTimeString(this DateTime value)
    {
        return value.ToString("yyyy-MM-dd hh:mm:ss tt");
    }

    public static string ToDateString(this DateTime? value)
    {
        return value.HasValue ? value.Value.ToString("yyyy-MM-dd") : string.Empty;
    }

    public static int ToInt(this string value)
    {
        return int.TryParse(value, out var result) ? result : 0;
    }

    public static int ToDateInt(this DateTime value)
    {
        return value.ToString("yyyyMMdd").ToInt();
    }

    public static string ToDateTimeString(this DateTime? value)
    {
        return value.HasValue ? value.Value.ToString("yyyy-MM-dd hh:mm:ss tt") : string.Empty;
    }

    public static DateTime? ToNullableDateTime(this string value)
    {
        return DateTime.TryParseExact(value, ["yyyy-MM-dd hh:mm:ss tt"], CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime dt) ? dt : null;
    }

    public static DateTime? ToNullableDate(this string value)
    {
        return DateTime.TryParseExact(value, ["yyyy-MM-dd", "yyyyMMdd"], CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime dt) ? dt : null;
    }
    public static DateTime? ToNullableDateTime(this int value)
    {
        return DateTime.TryParseExact(Convert.ToString(value), ["yyyy-MM-dd", "yyyyMMdd"], CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime dt) ? dt : null;
    }

    public static string ToJson(this object value)
    {
        if (value == null)
            return string.Empty;
        return JsonSerializer.Serialize(value);
    }

    public static string ToCamalCaseJson(this object value)
    {
        if (value == null)
            return string.Empty;
        return JsonSerializer.Serialize(value, jsonOptions);
    }
}
