using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class FixEmployeeOrgIDType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_Organizations_organizationID",
                table: "Employees");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Organizations",
                table: "Organizations");

            migrationBuilder.RenameTable(
                name: "Organizations",
                newName: "Organization");

            migrationBuilder.RenameColumn(
                name: "organizationID",
                table: "Employees",
                newName: "OrganizationID");

            migrationBuilder.RenameIndex(
                name: "IX_Employees_organizationID",
                table: "Employees",
                newName: "IX_Employees_OrganizationID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Organization",
                table: "Organization",
                column: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_Organization_OrganizationID",
                table: "Employees",
                column: "OrganizationID",
                principalTable: "Organization",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_Organization_OrganizationID",
                table: "Employees");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Organization",
                table: "Organization");

            migrationBuilder.RenameTable(
                name: "Organization",
                newName: "Organizations");

            migrationBuilder.RenameColumn(
                name: "OrganizationID",
                table: "Employees",
                newName: "organizationID");

            migrationBuilder.RenameIndex(
                name: "IX_Employees_OrganizationID",
                table: "Employees",
                newName: "IX_Employees_organizationID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Organizations",
                table: "Organizations",
                column: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_Organizations_organizationID",
                table: "Employees",
                column: "organizationID",
                principalTable: "Organizations",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
