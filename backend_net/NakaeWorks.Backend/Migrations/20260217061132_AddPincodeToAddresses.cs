using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NakaeWorks.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPincodeToAddresses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Pincode",
                table: "addresses",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Pincode",
                table: "addresses");
        }
    }
}
