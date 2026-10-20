using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddSliderTexts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AltBaslik",
                table: "Sliders",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Baslik",
                table: "Sliders",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ButonLinki",
                table: "Sliders",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ButonMetni",
                table: "Sliders",
                type: "TEXT",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Sliders",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "AltBaslik", "Baslik", "ButonLinki", "ButonMetni" },
                values: new object[] { "Yeni sezon ürünlerini keşfedin", "YENİ SEZON", "/shop", "Alışverişe Başla" });

            migrationBuilder.UpdateData(
                table: "Sliders",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "AltBaslik", "Baslik", "ButonLinki", "ButonMetni" },
                values: new object[] { "En çok tercih edilen parçalar", "HAFTANIN FAVORİLERİ", "/shop?category=6", "İncele" });

            migrationBuilder.UpdateData(
                table: "Sliders",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "AltBaslik", "Baslik", "ButonLinki", "ButonMetni" },
                values: new object[] { "Seçili ürünlerde kaçırılmayacak fiyatlar", "FIRSAT KÖŞESİ", "/shop", "Fırsatları Gör" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AltBaslik",
                table: "Sliders");

            migrationBuilder.DropColumn(
                name: "Baslik",
                table: "Sliders");

            migrationBuilder.DropColumn(
                name: "ButonLinki",
                table: "Sliders");

            migrationBuilder.DropColumn(
                name: "ButonMetni",
                table: "Sliders");
        }
    }
}
