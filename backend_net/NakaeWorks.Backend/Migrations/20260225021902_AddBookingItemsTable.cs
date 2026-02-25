using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace NakaeWorks.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingItemsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_bookings_services_service_id",
                table: "bookings");

            migrationBuilder.AlterColumn<long>(
                name: "service_id",
                table: "bookings",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.CreateTable(
                name: "booking_items",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    booking_id = table.Column<long>(type: "bigint", nullable: false),
                    service_id = table.Column<long>(type: "bigint", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    price = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    total = table.Column<decimal>(type: "numeric(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_booking_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_booking_items_bookings_booking_id",
                        column: x => x.booking_id,
                        principalTable: "bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_booking_items_services_service_id",
                        column: x => x.service_id,
                        principalTable: "services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_booking_items_booking_id",
                table: "booking_items",
                column: "booking_id");

            migrationBuilder.CreateIndex(
                name: "IX_booking_items_service_id",
                table: "booking_items",
                column: "service_id");

            migrationBuilder.AddForeignKey(
                name: "FK_bookings_services_service_id",
                table: "bookings",
                column: "service_id",
                principalTable: "services",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_bookings_services_service_id",
                table: "bookings");

            migrationBuilder.DropTable(
                name: "booking_items");

            migrationBuilder.AlterColumn<long>(
                name: "service_id",
                table: "bookings",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_bookings_services_service_id",
                table: "bookings",
                column: "service_id",
                principalTable: "services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
