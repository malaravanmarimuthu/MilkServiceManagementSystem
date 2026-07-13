using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class FixEmployeeType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProcurementEntries_Employees_EmployeeID1",
                table: "ProcurementEntries");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementEntries_EmployeeID1",
                table: "ProcurementEntries");

            migrationBuilder.DropColumn(
                name: "EmployeeID1",
                table: "ProcurementEntries");

            migrationBuilder.AlterColumn<long>(
                name: "EmployeeID",
                table: "ProcurementEntries",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementEntries_EmployeeID",
                table: "ProcurementEntries",
                column: "EmployeeID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProcurementEntries_Employees_EmployeeID",
                table: "ProcurementEntries",
                column: "EmployeeID",
                principalTable: "Employees",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProcurementEntries_Employees_EmployeeID",
                table: "ProcurementEntries");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementEntries_EmployeeID",
                table: "ProcurementEntries");

            migrationBuilder.AlterColumn<int>(
                name: "EmployeeID",
                table: "ProcurementEntries",
                type: "int",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddColumn<long>(
                name: "EmployeeID1",
                table: "ProcurementEntries",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementEntries_EmployeeID1",
                table: "ProcurementEntries",
                column: "EmployeeID1");

            migrationBuilder.AddForeignKey(
                name: "FK_ProcurementEntries_Employees_EmployeeID1",
                table: "ProcurementEntries",
                column: "EmployeeID1",
                principalTable: "Employees",
                principalColumn: "ID");
        }
    }
}
