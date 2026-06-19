using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeSubscriptionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EmployeeSubscriptions",
                columns: table => new
                {
                    EmployeeSubscriptionId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    EmployeeId = table.Column<long>(type: "bigint", nullable: false),
                    SubscriptionId = table.Column<long>(type: "bigint", nullable: false),
                    Status = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeSubscriptions", x => x.EmployeeSubscriptionId);
                    table.ForeignKey(
                        name: "FK_EmployeeSubscriptions_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EmployeeSubscriptions_Subscriptions_SubscriptionId",
                        column: x => x.SubscriptionId,
                        principalTable: "Subscriptions",
                        principalColumn: "SubscriptionID",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_LocationID",
                table: "Employees",
                column: "LocationID");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_RoleID",
                table: "Employees",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeSubscriptions_EmployeeId",
                table: "EmployeeSubscriptions",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeSubscriptions_SubscriptionId",
                table: "EmployeeSubscriptions",
                column: "SubscriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_Locations_LocationID",
                table: "Employees",
                column: "LocationID",
                principalTable: "Locations",
                principalColumn: "LocationID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_Roles_RoleID",
                table: "Employees",
                column: "RoleID",
                principalTable: "Roles",
                principalColumn: "RoleID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_Locations_LocationID",
                table: "Employees");

            migrationBuilder.DropForeignKey(
                name: "FK_Employees_Roles_RoleID",
                table: "Employees");

            migrationBuilder.DropTable(
                name: "EmployeeSubscriptions");

            migrationBuilder.DropIndex(
                name: "IX_Employees_LocationID",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_RoleID",
                table: "Employees");
        }
    }
}
