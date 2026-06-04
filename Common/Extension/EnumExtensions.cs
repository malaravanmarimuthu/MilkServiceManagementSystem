using System.ComponentModel;
using System.Reflection;

namespace Common.Extension;

public static class EnumExtensions
{
    public static string GetEnumDescription(this Enum enumVal)
    {
        System.Reflection.MemberInfo[] memInfo = enumVal.GetType().GetMember(enumVal.ToString());
        DescriptionAttribute attribute = CustomAttributeExtensions.GetCustomAttribute<DescriptionAttribute>(memInfo[0]);
        return attribute.Description;
    }
}
