using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCampaignSeedContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Campaigns",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Title" },
                values: new object[] { "Sezonun en çok konuşulan parçaları şimdi mağazada.", "Yeni Sezon Koleksiyonu" });

            migrationBuilder.UpdateData(
                table: "Campaigns",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Title" },
                values: new object[] { "En çok tercih edilen ürünleri keşfet, tarzını tamamla.", "Haftanın Favorileri" });

            migrationBuilder.UpdateData(
                table: "Campaigns",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Title" },
                values: new object[] { "Her dolapta olması gereken, uzun ömürlü parçalar.", "Zamansız Klasikler" });

            migrationBuilder.UpdateData(
                table: "Campaigns",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Title" },
                values: new object[] { "Seçili ürünlerde kaçırılmayacak fiyatlar.", "Fırsat Köşesi" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Campaigns",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Title" },
                values: new object[] { "Lorem ipsum dolor sit amet consectetur adipiscing elit dolor", "Fashion Month Ready in Capital Shop" });

            migrationBuilder.UpdateData(
                table: "Campaigns",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Title" },
                values: new object[] { "Lorem ipsum dolor sit amet consectetur adipiscing elit dolor", "Fashion Month Ready in Capital Shop" });

            migrationBuilder.UpdateData(
                table: "Campaigns",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Title" },
                values: new object[] { "Lorem ipsum dolor sit amet consectetur adipiscing elit dolor", "Fashion Month Ready in Capital Shop" });

            migrationBuilder.UpdateData(
                table: "Campaigns",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Title" },
                values: new object[] { "Lorem ipsum dolor sit amet consectetur adipiscing elit dolor", "Fashion Month Ready in Capital Shop" });
        }
    }
}
