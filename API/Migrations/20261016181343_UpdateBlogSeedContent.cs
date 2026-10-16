using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBlogSeedContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Blogs",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Title" },
                values: new object[] { "<p>Her sezon onlarca yeni trend gelip geçiyor, ama bazı parçalar dolabımızda yıllarca kalıyor. Bu parçaları özel kılan şey moda olmaları değil; doğru kesim, iyi kumaş ve her kombine uyum sağlayabilmeleri. Bu yazıda, gardırobunuzun temelini oluşturacak parçaları ve onları nasıl seçeceğinizi anlatıyoruz.</p>\n<h2>1. İyi kesimli bir ceket</h2>\n<p>Omuz çizgisi tam oturan bir ceket, en sade kombini bile toparlar. Satın alırken önce omuzlara bakın: dikiş, omuz kemiğinizin bittiği noktada olmalı. Kol boyu bileği hafifçe geçmeli, gömlek manşeti 1-2 cm görünebilmeli.</p>\n<h2>2. Yüksek bel pantolon</h2>\n<p>Yüksek bel kesim bacakları daha uzun gösterir ve hem tişörtle hem de gömlekle rahatça kombinlenir. <strong>Pamuk ağırlıklı, az miktarda elastan içeren</strong> kumaşlar gün boyu formunu korur ve hareket rahatlığı sağlar.</p>\n<h2>3. Sade, kaliteli bir tişört</h2>\n<p>Beyaz, siyah ya da gri bir tişört; ceketin altında, pantolonla ya da etekle aynı başarıyı gösterir. Kumaşın kalınlığına dikkat edin: biraz daha kalın gramajlı tişörtler yıkamadan sonra şeklini daha uzun korur.</p>\n<h2>4. Kombini tamamlayan aksesuarlar</h2>\n<p>Bir saat, ince bir kemer ya da sezona uygun bir bere; aynı kıyafeti bambaşka bir havaya sokabilir. Aksesuarda kural basit: kombinde tek bir dikkat çekici parça yeterli.</p>\n<blockquote>Stil, ne kadar çok parçanız olduğuyla değil, elinizdeki parçaları ne kadar iyi kullandığınızla ilgilidir.</blockquote>\n<h3>Alışverişten önce kısa bir kontrol listesi</h3>\n<ul>\n    <li>Bu parçayla dolabımdaki en az üç ürünü kombinleyebilir miyim?</li>\n    <li>Kumaş içeriği ve bakım talimatları bana uygun mu?</li>\n    <li>Kesim vücuduma oturuyor mu, yoksa terziye mi ihtiyaç var?</li>\n</ul>\n<p>Az ama doğru seçilmiş parçalarla kurulan bir gardırop, hem zamandan hem bütçeden tasarruf ettirir. Yeni sezon ürünlerimize göz atarken bu listeyi aklınızda tutmanızı öneririz.</p>", "Modayı Şekillendiren Parçalar" });

            migrationBuilder.UpdateData(
                table: "Blogs",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedDate", "Description", "Title", "UpdatedDate" },
                values: new object[] { new DateTime(2026, 6, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), "<p>Sokak stili artık podyumlardan ilham almıyor; tam tersine, podyumlar sokaktan ilham alıyor. Rahatlık ve kişisel ifade bu akımın merkezinde. Bu sezon öne çıkan sokak stili trendlerini ve onları günlük hayata nasıl taşıyabileceğinizi derledik.</p>\n<h2>Bol kesimler geri döndü</h2>\n<p>Geniş paça pantolonlar, omuzdan düşük tişörtler ve oversize ceketler sezonun en çok tercih edilen parçaları arasında. Bol bir parçayı dengelemenin en kolay yolu, kombinin geri kalanını daha oturan seçmek: <em>oversize bir ceketin altına düz bir pantolon</em> gibi.</p>\n<h2>Katmanlı giyim</h2>\n<p>İnce bir tişört, üzerine açık gömlek, en üstte hafif bir ceket… Katmanlı giyim hem mevsim geçişlerinde pratik hem de kombine derinlik katıyor. Katmanlarda renkleri aynı ton ailesinden seçmek, görünümün dağınık durmasını engeller.</p>\n<h2>Nötr renkler, tek bir vurgu</h2>\n<p>Sezonun renk paletine bej, haki, gri ve siyah hâkim. Bu sakin tabanın üzerine tek bir canlı renk, örneğin kırmızı bir bere ya da çanta, eklemek kombini bir anda öne çıkarıyor.</p>\n<blockquote>Sokak stilinin tek kuralı var: kendiniz gibi hissetmek.</blockquote>\n<h3>Bu sezon denemeniz gereken üç kombin</h3>\n<ul>\n    <li><strong>Günlük:</strong> beyaz tişört, yüksek bel kot, spor ayakkabı ve ince bir zincir kolye</li>\n    <li><strong>Hafta sonu:</strong> oversize sweatshirt, kargo pantolon ve renkli bir bere</li>\n    <li><strong>Akşam:</strong> siyah boğazlı kazak, düz kesim pantolon ve deri ceket</li>\n</ul>\n<p>Trendleri birebir kopyalamak yerine, size en çok uyan bir-iki fikri seçip kendi tarzınıza eklemeyi deneyin. Sokak stili zaten tam olarak bu: kişisel yorum.</p>", "Modern Sokak Stili Trendleri", new DateTime(2026, 6, 18, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.UpdateData(
                table: "Blogs",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedDate", "Description", "Title", "UpdatedDate" },
                values: new object[] { new DateTime(2026, 8, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), "<p>Lüks denildiğinde akla ilk gelen yüksek fiyatlar olsa da, köklü moda evlerini gerçekten ayıran şey fiyat değil; işçilik, malzeme ve zamansız tasarım anlayışı. Peki bu anlayışı kendi gardırobumuza nasıl taşıyabiliriz?</p>\n<h2>İşçilik ayrıntıda gizlidir</h2>\n<p>Düzgün ve sık dikişler, birbirine denk gelen desenler, sağlam düğmeler ve temiz iç astarlar… İyi bir ürünü tanımak için etiketine değil, iç tarafına bakın. Ayrıntılara gösterilen özen, ürünün yıllarca kullanılıp kullanılamayacağını belirler.</p>\n<h2>Malzeme kaliteyi taşır</h2>\n<p>Yün, ipek, keten ve kaliteli pamuk gibi doğal lifler hem daha iyi nefes alır hem de zamanla daha güzel yaşlanır. Etikette <strong>kumaş içeriğini</strong> okumak, kaliteli bir alışverişin ilk adımıdır.</p>\n<h2>Zamansız tasarım</h2>\n<p>Lüks markaların en bilinen parçaları genellikle en sade olanlarıdır: iyi kesimli bir trençkot, klasik bir saat, yalın bir çanta. Bu parçalar bir sezonun trendine değil, yılların birikimine dayanır.</p>\n<blockquote>Gerçek zarafet dikkat çekmeye çalışmaz; fark edilir.</blockquote>\n<h3>Lüks hissini bütçeyi zorlamadan yakalamak</h3>\n<ul>\n    <li>Çok sayıda trend parça yerine, az sayıda kaliteli temel parçaya yatırım yapın.</li>\n    <li>Renk paletinizi sınırlı tutun; birbirine uyan parçalar daha şık görünür.</li>\n    <li>Kıyafetlerinizin bakımını ihmal etmeyin: doğru yıkama ve ütü, bir parçanın ömrünü ikiye katlar.</li>\n</ul>\n<p>Zarafet bir marka adı değil, bir tercih biçimidir. Aldığınız her parçanın uzun süre sizinle kalacağını düşünerek seçim yaptığınızda, gardırobunuz da zamanla bu anlayışı yansıtacaktır.</p>", "Zarafetin Tanımı: Lüks Markalar", new DateTime(2026, 8, 3, 0, 0, 0, 0, DateTimeKind.Unspecified) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Blogs",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Title" },
                values: new object[] { "Fashion dünyasında öne çıkan ürünleri keşfedin.", "The Best Products That Shape Fashion" });

            migrationBuilder.UpdateData(
                table: "Blogs",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedDate", "Description", "Title", "UpdatedDate" },
                values: new object[] { new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), "Sokak modasında yeni trendler ve kombin önerileri.", "Modern Street Style Trends", new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.UpdateData(
                table: "Blogs",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedDate", "Description", "Title", "UpdatedDate" },
                values: new object[] { new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), "Lüks markaların stil dünyasına etkisi.", "Luxury Brands That Define Elegance", new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Unspecified) });
        }
    }
}
