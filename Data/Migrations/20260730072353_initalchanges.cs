using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class initalchanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Employees_EmployeeID1",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_MilkEntries_MilkEntryID1",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Payments_EmployeeID1",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Payments_MilkEntryID1",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "EmployeeID1",
                table: "Payments");

            migrationBuilder.RenameColumn(
                name: "MilkEntryID1",
                table: "Payments",
                newName: "InvoiceID");

            migrationBuilder.AlterColumn<decimal>(
                name: "RatePerLiter",
                table: "Payments",
                type: "decimal(65,30)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(65,30)");

            migrationBuilder.AlterColumn<decimal>(
                name: "Quantity",
                table: "Payments",
                type: "decimal(65,30)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(65,30)");

            migrationBuilder.AlterColumn<long>(
                name: "MilkEntryID",
                table: "Payments",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<long>(
                name: "EmployeeID",
                table: "Payments",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_EmployeeID",
                table: "Payments",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_MilkEntryID",
                table: "Payments",
                column: "MilkEntryID");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Employees_EmployeeID",
                table: "Payments",
                column: "EmployeeID",
                principalTable: "Employees",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_MilkEntries_MilkEntryID",
                table: "Payments",
                column: "MilkEntryID",
                principalTable: "MilkEntries",
                principalColumn: "MilkEntryID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Employees_EmployeeID",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_MilkEntries_MilkEntryID",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Payments_EmployeeID",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Payments_MilkEntryID",
                table: "Payments");

            migrationBuilder.RenameColumn(
                name: "InvoiceID",
                table: "Payments",
                newName: "MilkEntryID1");

            migrationBuilder.AlterColumn<decimal>(
                name: "RatePerLiter",
                table: "Payments",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(65,30)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Quantity",
                table: "Payments",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(65,30)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "MilkEntryID",
                table: "Payments",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "EmployeeID",
                table: "Payments",
                type: "int",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddColumn<long>(
                name: "EmployeeID1",
                table: "Payments",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_EmployeeID1",
                table: "Payments",
                column: "EmployeeID1");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_MilkEntryID1",
                table: "Payments",
                column: "MilkEntryID1");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Employees_EmployeeID1",
                table: "Payments",
                column: "EmployeeID1",
                principalTable: "Employees",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_MilkEntries_MilkEntryID1",
                table: "Payments",
                column: "MilkEntryID1",
                principalTable: "MilkEntries",
                principalColumn: "MilkEntryID");
        }
    }
}
