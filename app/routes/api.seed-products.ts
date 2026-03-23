/**
 * API Route to Seed Rich Content Products
 * 
 * This uses the app's authenticated session to push products to Shopify.
 */

import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

const richProducts = [
  {
    title: "Elegant Abaya with Embroidery - Full Coverage Modest Wear",
    descriptionHtml: `<h2>Exquisite Abaya for the Modern Muslim Woman</h2>
<p>Experience elegance and modesty with our <strong>premium embroidered abaya</strong>. Designed for the discerning woman who values both style and faith.</p>
<h3>Key Features:</h3>
<ul>
<li><strong>Full Coverage Design:</strong> Floor-length with long sleeves for complete modesty</li>
<li><strong>Premium Fabric:</strong> Lightweight crepe that's breathable and comfortable</li>
<li><strong>Intricate Embroidery:</strong> Hand-stitched floral patterns along the sleeves and hem</li>
<li><strong>Perfect for:</strong> Daily wear, prayers, Eid celebrations, and special occasions</li>
</ul>
<h3>Size Guide:</h3>
<p>Available in sizes S-3XL. Please refer to our size chart for measurements.</p>
<h3>Care Instructions:</h3>
<p>Hand wash or dry clean recommended. Do not bleach. Iron on low heat.</p>
<p><em>"This abaya combines traditional values with contemporary fashion. Perfect for Ramadan and Eid."</em></p>`,
    productType: "Modest Fashion",
    vendor: "RashRash Modest",
    tags: ["abaya", "modest-wear", "full-coverage", "islamic-clothing", "ramadan", "eid", "hijab-friendly", "muslim-fashion"],
    options: ["Size", "Color"],
    variants: [
      { options: ["S", "Black"], price: "189.00", sku: "ABY-EMB-BLK-S", inventoryQty: 15 },
      { options: ["M", "Black"], price: "189.00", sku: "ABY-EMB-BLK-M", inventoryQty: 20 },
      { options: ["L", "Black"], price: "189.00", sku: "ABY-EMB-BLK-L", inventoryQty: 18 },
      { options: ["XL", "Black"], price: "189.00", sku: "ABY-EMB-BLK-XL", inventoryQty: 12 },
      { options: ["S", "Navy Blue"], price: "189.00", sku: "ABY-EMB-NVY-S", inventoryQty: 10 },
      { options: ["M", "Navy Blue"], price: "189.00", sku: "ABY-EMB-NVY-M", inventoryQty: 14 },
      { options: ["L", "Navy Blue"], price: "189.00", sku: "ABY-EMB-NVY-L", inventoryQty: 11 },
    ],
    seoTitle: "Elegant Embroidered Abaya | Full Coverage Modest Fashion",
    seoDescription: "Premium embroidered abaya for Muslim women. Full coverage, lightweight fabric, perfect for daily wear and special occasions. Shop modest Islamic clothing."
  },
  {
    title: "Premium Hijab Set - 5 Piece Chiffon Scarves",
    descriptionHtml: `<h2>Luxury Chiffon Hijab Collection</h2>
<p>Elevate your hijab game with our <strong>5-piece premium chiffon set</strong>. Each scarf is carefully selected to provide versatility, comfort, and elegance for every occasion.</p>
<h3>What's Included:</h3>
<ul>
<li>5 beautiful chiffon hijabs in complementary colors</li>
<li>Matching undercaps for secure fit</li>
<li>Hijab pins set (20 pins)</li>
<li>Storage pouch</li>
</ul>
<h3>Features:</h3>
<ul>
<li><strong>Non-slip fabric:</strong> Stays in place all day</li>
<li><strong>Breathable:</strong> Perfect for hot climates</li>
<li><strong>Easy care:</strong> Wrinkle-resistant and machine washable</li>
<li><strong>Generous size:</strong> 180cm x 70cm for full coverage styling</li>
</ul>
<h3>Perfect For:</h3>
<p>Daily wear, work, school, special events, and gifting. This set makes an ideal <strong>Eid gift</strong> or <strong>wedding present</strong>.</p>
<p><em>"The quality is exceptional. These hijabs drape beautifully and the colors are exactly as shown." - Aisha K.</em></p>`,
    productType: "Hijab & Scarves",
    vendor: "RashRash Modest",
    tags: ["hijab", "scarf", "chiffon", "muslim-women", "islamic-accessories", "modest-fashion", "head-covering", "eid-gift", "5-piece-set"],
    options: ["Color Set"],
    variants: [
      { options: ["Classic (Black, Navy, Grey, Beige, White)"], price: "79.00", sku: "HJB-SET-CLS", inventoryQty: 25 },
      { options: ["Earth Tones (Brown, Olive, Rust, Cream, Taupe)"], price: "79.00", sku: "HJB-SET-ERT", inventoryQty: 20 },
      { options: ["Pastel (Pink, Lavender, Mint, Peach, Sky Blue)"], price: "79.00", sku: "HJB-SET-PST", inventoryQty: 18 },
    ],
    seoTitle: "Premium Chiffon Hijab Set - 5 Piece | Muslim Women Fashion",
    seoDescription: "Luxury 5-piece chiffon hijab set with undercaps and pins. Non-slip, breathable, perfect for daily wear. Shop quality Islamic scarves."
  },
  {
    title: "Modest Swimwear Burkini - Full Coverage Islamic Swimsuit",
    descriptionHtml: `<h2>Swim with Confidence in Our Premium Burkini</h2>
<p>Enjoy the beach and pool while maintaining your modesty with our <strong>stylish and comfortable burkini</strong>. Designed specifically for Muslim women who refuse to compromise on their values.</p>
<h3>Complete 3-Piece Set Includes:</h3>
<ul>
<li><strong>Long tunic top:</strong> Loose fit with modest length</li>
<li><strong>Swim pants:</strong> Full length, quick-dry fabric</li>
<li><strong>Swim hijab cap:</strong> Secure fit, water-friendly</li>
</ul>
<h3>Technical Features:</h3>
<ul>
<li><strong>Chlorine-resistant:</strong> Maintains color and shape</li>
<li><strong>UPF 50+ protection:</strong> Blocks 98% of harmful UV rays</li>
<li><strong>Quick-dry technology:</strong> No more sitting in wet clothes</li>
<li><strong>4-way stretch:</strong> Freedom of movement for swimming</li>
</ul>
<h3>Size Range:</h3>
<p>XS to 4XL available. Our sizing is generous to ensure comfortable, modest coverage.</p>
<h3>Care:</h3>
<p>Rinse after use in chlorine or salt water. Machine washable on gentle cycle.</p>
<p><em>"Finally a burkini that looks good and performs well in water. I can swim laps comfortably!" - Fatima M.</em></p>`,
    productType: "Modest Swimwear",
    vendor: "RashRash Modest",
    tags: ["burkini", "modest-swimwear", "islamic-swimsuit", "full-coverage", "muslim-swimwear", "halal-swim", "uv-protection", "plus-size"],
    options: ["Size", "Color"],
    variants: [
      { options: ["S", "Black"], price: "145.00", sku: "BRK-BLK-S", inventoryQty: 12 },
      { options: ["M", "Black"], price: "145.00", sku: "BRK-BLK-M", inventoryQty: 15 },
      { options: ["L", "Black"], price: "145.00", sku: "BRK-BLK-L", inventoryQty: 14 },
      { options: ["XL", "Black"], price: "145.00", sku: "BRK-BLK-XL", inventoryQty: 10 },
      { options: ["2XL", "Black"], price: "145.00", sku: "BRK-BLK-2XL", inventoryQty: 8 },
      { options: ["S", "Navy"], price: "145.00", sku: "BRK-NVY-S", inventoryQty: 10 },
      { options: ["M", "Navy"], price: "145.00", sku: "BRK-NVY-M", inventoryQty: 12 },
      { options: ["L", "Navy"], price: "145.00", sku: "BRK-NVY-L", inventoryQty: 11 },
    ],
    seoTitle: "Modest Burkini Swimsuit | Full Coverage Islamic Swimwear UPF 50+",
    seoDescription: "Premium 3-piece burkini set for Muslim women. UPF 50+ protection, quick-dry, chlorine-resistant. Modest swimwear in sizes XS-4XL."
  },
  {
    title: "Kaftan Dress - Moroccan Style Evening Gown",
    descriptionHtml: `<h2>Authentic Moroccan Kaftan for Special Occasions</h2>
<p>Step into elegance with our <strong>handcrafted Moroccan kaftan</strong>. This stunning piece combines traditional North African design with modern sophistication.</p>
<h3>Design Details:</h3>
<ul>
<li><strong>Intricate gold embroidery:</strong> Traditional motifs along neckline and hem</li>
<li><strong>Flowing silhouette:</strong> Flattering A-line cut for all body types</li>
<li><strong>Luxurious satin fabric:</strong> Rich drape and elegant sheen</li>
<li><strong>Long sleeves:</strong> Full coverage with decorative cuffs</li>
</ul>
<h3>Perfect For:</h3>
<ul>
<li>Wedding guests and bridal parties</li>
<li>Eid celebrations</li>
<li>Iftar gatherings during Ramadan</li>
<li>Formal dinner parties</li>
<li>Special family occasions</li>
</ul>
<h3>Styling Tips:</h3>
<p>Pair with gold accessories and our matching hijab for a complete look. The kaftan can be belted for a more fitted silhouette or worn loose for traditional style.</p>
<h3>Available Colors:</h3>
<p>Emerald Green, Royal Blue, Burgundy, Gold, and Classic Black</p>
<p><em>"Wore this to my sister's wedding and received so many compliments. The quality is exceptional!" - Layla R.</em></p>`,
    productType: "Modest Evening Wear",
    vendor: "RashRash Modest",
    tags: ["kaftan", "moroccan-dress", "evening-gown", "formal-wear", "wedding-guest", "eid-dress", "islamic-fashion", "modest-evening", "embroidered-dress"],
    options: ["Size", "Color"],
    variants: [
      { options: ["S", "Emerald Green"], price: "299.00", sku: "KFT-EMR-S", inventoryQty: 5 },
      { options: ["M", "Emerald Green"], price: "299.00", sku: "KFT-EMR-M", inventoryQty: 7 },
      { options: ["L", "Emerald Green"], price: "299.00", sku: "KFT-EMR-L", inventoryQty: 6 },
      { options: ["S", "Royal Blue"], price: "299.00", sku: "KFT-RBL-S", inventoryQty: 4 },
      { options: ["M", "Royal Blue"], price: "299.00", sku: "KFT-RBL-M", inventoryQty: 6 },
      { options: ["L", "Royal Blue"], price: "299.00", sku: "KFT-RBL-L", inventoryQty: 5 },
      { options: ["M", "Burgundy"], price: "299.00", sku: "KFT-BRG-M", inventoryQty: 8 },
      { options: ["L", "Burgundy"], price: "299.00", sku: "KFT-BRG-L", inventoryQty: 7 },
    ],
    seoTitle: "Moroccan Kaftan Dress | Elegant Evening Gown | Modest Formal Wear",
    seoDescription: "Handcrafted Moroccan kaftan with gold embroidery. Perfect for weddings, Eid, and special occasions. Luxurious satin, full coverage design."
  },
  {
    title: "Modest Activewear Set - Sports Hijab & Tunic",
    descriptionHtml: `<h2>Stay Active, Stay Modest</h2>
<p>Our <strong>modest activewear set</strong> is designed for Muslim women who want to stay fit without compromising their values. Perfect for gym, running, yoga, and sports.</p>
<h3>Set Includes:</h3>
<ul>
<li><strong>Long sport tunic:</strong> Breathable, loose fit with side slits for movement</li>
<li><strong>Sport leggings:</strong> High-waisted, full length with modest coverage</li>
<li><strong>Sports hijab:</strong> Secure fit, moisture-wicking fabric</li>
</ul>
<h3>Performance Features:</h3>
<ul>
<li><strong>Moisture-wicking:</strong> Keeps you dry during intense workouts</li>
<li><strong>4-way stretch:</strong> Full range of motion</li>
<li><strong>Anti-odor technology:</strong> Fresh even after long sessions</li>
<li><strong>Flat seams:</strong> Prevents chafing</li>
<li><strong>Hidden pockets:</strong> Store your phone and keys</li>
</ul>
<h3>Activities Perfect For:</h3>
<p>Running, gym workouts, yoga, pilates, hiking, cycling, and team sports</p>
<h3>Why Muslim Women Love This Set:</h3>
<p><em>"Finally activewear that covers properly and performs well. I can run comfortably without worrying about my hijab slipping or my top riding up." - Sarah H.</em></p>
<p><em>"The fabric is amazing - keeps me cool during HIIT workouts. Highly recommend!" - Nadia A.</em></p>`,
    productType: "Modest Sportswear",
    vendor: "RashRash Modest",
    tags: ["activewear", "sportswear", "sports-hijab", "modest-sports", "gym-wear", "running", "yoga", "fitness", "athletic-wear", "muslim-athlete"],
    options: ["Size", "Color"],
    variants: [
      { options: ["S", "Black"], price: "129.00", sku: "ACT-BLK-S", inventoryQty: 20 },
      { options: ["M", "Black"], price: "129.00", sku: "ACT-BLK-M", inventoryQty: 25 },
      { options: ["L", "Black"], price: "129.00", sku: "ACT-BLK-L", inventoryQty: 22 },
      { options: ["XL", "Black"], price: "129.00", sku: "ACT-BLK-XL", inventoryQty: 18 },
      { options: ["S", "Grey"], price: "129.00", sku: "ACT-GRY-S", inventoryQty: 15 },
      { options: ["M", "Grey"], price: "129.00", sku: "ACT-GRY-M", inventoryQty: 20 },
      { options: ["L", "Grey"], price: "129.00", sku: "ACT-GRY-L", inventoryQty: 18 },
      { options: ["S", "Navy"], price: "129.00", sku: "ACT-NVY-S", inventoryQty: 12 },
      { options: ["M", "Navy"], price: "129.00", sku: "ACT-NVY-M", inventoryQty: 15 },
    ],
    seoTitle: "Modest Activewear Set | Sports Hijab & Tunic | Muslim Athletic Wear",
    seoDescription: "Complete modest sportswear set with tunic, leggings & sports hijab. Moisture-wicking, 4-way stretch. Perfect for gym, running & yoga."
  },
  {
    title: "Jilbab Two-Piece Prayer Set - Loose Fit Overgarment",
    descriptionHtml: `<h2>Complete Prayer Attire for Muslim Women</h2>
<p>Our <strong>two-piece jilbab set</strong> provides complete coverage for prayer and daily wear. Designed with Islamic principles in mind, this overgarment is both practical and elegant.</p>
<h3>Two-Piece Design:</h3>
<ul>
<li><strong>Long khimar (head & body covering):</strong> Flows gracefully to knee length</li>
<li><strong>Matching skirt:</strong> Full length, elastic waist for comfort</li>
<li><strong>Optional face veil:</strong> Attached for full coverage option</li>
</ul>
<h3>Ideal Uses:</h3>
<ul>
<li>Daily prayers (Salah)</li>
<li>Taraweeh during Ramadan</li>
<li>Umrah and Hajj pilgrimages</li>
<li>Mosque visits</li>
<li>Islamic classes and gatherings</li>
</ul>
<h3>Fabric Features:</h3>
<ul>
<li><strong>Lightweight crepe:</strong> Perfect for all seasons</li>
<li><strong>Non-transparent:</strong> Opaque fabric ensures modesty</li>
<li><strong>Breathable:</strong> Stay cool during long prayers</li>
<li><strong>Wrinkle-resistant:</strong> Always looks presentable</li>
</ul>
<h3>One Size Fits Most:</h3>
<p>Designed to accommodate heights 5'2" to 5'10". Elastic waistband adjusts to your size.</p>
<p><em>"I wear this for every prayer. It's so comfortable and easy to put on quickly. The fabric is beautiful and drapes nicely." - Khadija T.</em></p>`,
    productType: "Islamic Prayer Wear",
    vendor: "RashRash Modest",
    tags: ["jilbab", "prayer-clothes", "khimar", "islamic-wear", "salah", "ramadan", "umrah", "hajj", "mosque", "full-coverage", "overgarment"],
    options: ["Color"],
    variants: [
      { options: ["Black"], price: "89.00", sku: "JLB-BLK", inventoryQty: 30 },
      { options: ["Navy Blue"], price: "89.00", sku: "JLB-NVY", inventoryQty: 25 },
      { options: ["Coffee Brown"], price: "89.00", sku: "JLB-COF", inventoryQty: 20 },
      { options: ["Dark Grey"], price: "89.00", sku: "JLB-GRY", inventoryQty: 22 },
    ],
    seoTitle: "Jilbab Two-Piece Prayer Set | Islamic Prayer Clothes | Khimar",
    seoDescription: "Complete jilbab set for Muslim women. Two-piece prayer attire perfect for Salah, Ramadan, Umrah & Hajj. Lightweight, opaque, one size fits most."
  },
  {
    title: "Niqab Face Veil - 3 Layer Breathable Design",
    descriptionHtml: `<h2>Premium Niqab for Full Face Coverage</h2>
<p>Our <strong>three-layer niqab</strong> is designed for sisters who observe full face covering. Made with breathable, lightweight fabric for all-day comfort.</p>
<h3>Three-Layer Design:</h3>
<ul>
<li><strong>Top layer:</strong> Covers nose and extends to forehead</li>
<li><strong>Middle layer:</strong> Optional eye coverage flap</li>
<li><strong>Bottom layer:</strong> Covers mouth and chin</li>
</ul>
<h3>Features:</h3>
<ul>
<li><strong>Breathable mesh panels:</strong> Easy breathing without compromising coverage</li>
<li><strong>Adjustable straps:</strong> Secure fit for all face shapes</li>
<li><strong>No-gap design:</strong> Proper coverage of entire face</li>
<li><strong>Soft edges:</strong> No irritation on sensitive skin</li>
</ul>
<h3>When to Wear:</h3>
<p>Perfect for daily wear, religious occasions, or whenever you desire additional modesty. Many sisters wear this for increased protection and privacy.</p>
<h3>Care Instructions:</h3>
<p>Hand wash recommended. Air dry to maintain shape.</p>
<p><em>"The best niqab I've worn. The breathing panels make such a difference, especially in summer." - Anonymous</em></p>`,
    productType: "Islamic Face Covering",
    vendor: "RashRash Modest",
    tags: ["niqab", "face-veil", "full-coverage", "islamic-clothing", "modest-wear", "privacy", "muslim-women"],
    options: ["Color"],
    variants: [
      { options: ["Black"], price: "45.00", sku: "NQB-BLK", inventoryQty: 40 },
      { options: ["Navy"], price: "45.00", sku: "NQB-NVY", inventoryQty: 35 },
      { options: ["Dark Grey"], price: "45.00", sku: "NQB-GRY", inventoryQty: 30 },
    ],
    seoTitle: "Niqab Face Veil - 3 Layer | Breathable Islamic Face Covering",
    seoDescription: "Premium 3-layer niqab with breathable mesh panels. Full face coverage with adjustable straps. Comfortable all-day wear for Muslim women."
  },
  {
    title: "Long Sleeve Maxi Dress - Floral Print Modest Fashion",
    descriptionHtml: `<h2>Elegant Floral Maxi Dress for Modest Fashion</h2>
<p>Discover the perfect blend of style and modesty with our <strong>long sleeve maxi dress</strong>. The beautiful floral print adds femininity while the full coverage design respects Islamic principles.</p>
<h3>Dress Features:</h3>
<ul>
<li><strong>Floor-length hem:</strong> Complete coverage from neck to ankle</li>
<li><strong>Long sleeves:</strong> Full arm coverage with fitted cuffs</li>
<li><strong>Modest neckline:</strong> High neck design, no cleavage visible</li>
<li><strong>Flowing A-line cut:</strong> Flattering without being tight</li>
<li><strong>Side pockets:</strong> Practical and convenient</li>
</ul>
<h3>Fabric:</h3>
<p>Premium polyester crepe that's lightweight, breathable, and drapes beautifully. The fabric is <strong>fully opaque</strong> - no see-through areas.</p>
<h3>Perfect For:</h3>
<ul>
<li>Work and professional settings</li>
<li>Family gatherings and dinners</li>
<li>Eid celebrations</li>
<li>Friday prayers</li>
<li>Everyday modest fashion</li>
</ul>
<h3>Styling Suggestions:</h3>
<p>Pair with a coordinating hijab and modest heels for a complete look. Add a belt for waist definition if desired.</p>
<p><em>"This dress is gorgeous! The print is beautiful and I get compliments every time I wear it. Very comfortable for all-day wear." - Maryam F.</em></p>`,
    productType: "Modest Dresses",
    vendor: "RashRash Modest",
    tags: ["maxi-dress", "long-sleeve", "modest-dress", "floral-print", "islamic-fashion", "muslim-women", "full-coverage", "eid-dress", "work-wear"],
    options: ["Size", "Print"],
    variants: [
      { options: ["S", "Rose Garden"], price: "119.00", sku: "MXD-RSE-S", inventoryQty: 12 },
      { options: ["M", "Rose Garden"], price: "119.00", sku: "MXD-RSE-M", inventoryQty: 15 },
      { options: ["L", "Rose Garden"], price: "119.00", sku: "MXD-RSE-L", inventoryQty: 14 },
      { options: ["S", "Midnight Bloom"], price: "119.00", sku: "MXD-BLM-S", inventoryQty: 10 },
      { options: ["M", "Midnight Bloom"], price: "119.00", sku: "MXD-BLM-M", inventoryQty: 12 },
      { options: ["L", "Midnight Bloom"], price: "119.00", sku: "MXD-BLM-L", inventoryQty: 11 },
      { options: ["S", "Autumn Leaves"], price: "119.00", sku: "MXD-ATM-S", inventoryQty: 8 },
      { options: ["M", "Autumn Leaves"], price: "119.00", sku: "MXD-ATM-M", inventoryQty: 10 },
    ],
    seoTitle: "Long Sleeve Maxi Dress Floral | Modest Islamic Fashion Dress",
    seoDescription: "Elegant floral maxi dress with long sleeves. Full coverage, opaque fabric. Perfect for work, Eid & everyday wear. Modest fashion for Muslim women."
  },
  {
    title: "Islamic Children's Clothing Set - Girl's Modest Outfit",
    descriptionHtml: `<h2>Modest Fashion for Young Muslim Girls</h2>
<p>Teach your daughter the beauty of modesty from an early age with our <strong>adorable children's modest clothing set</strong>. Comfortable, practical, and stylish!</p>
<h3>Set Includes:</h3>
<ul>
<li><strong>Long sleeve tunic top:</strong> Pastel colors with cute embroidery</li>
<li><strong>Matching pants:</strong> Elastic waist, comfortable fit</li>
<li><strong>Mini hijab:</strong> Easy-to-wear slip-on style</li>
<li><strong>Hair clips set:</strong> Coordinating accessories</li>
</ul>
<h3>Child-Friendly Features:</h3>
<ul>
<li><strong>Easy on/off:</strong> No complicated fastenings</li>
<li><strong>Stretchy waistbands:</strong> Room to grow</li>
<li><strong>Durable fabric:</strong> Withstands active play</li>
<li><strong>Machine washable:</strong> Easy care for busy parents</li>
<li><strong>No itchy tags:</strong> Tagless design for comfort</li>
</ul>
<h3>Age Range:</h3>
<p>Sizes available from 2T to 12 years. Please check our size chart for measurements.</p>
<h3>Perfect For:</h3>
<ul>
<li>Islamic school uniform</li>
<li>Friday prayers at the mosque</li>
<li>Eid celebrations</li>
<li>Family gatherings</li>
<li>Daily modest wear</li>
</ul>
<p><em>"My daughter loves wearing her 'special outfit' to the mosque. The fabric is soft and she can play comfortably." - Parent Review</em></p>`,
    productType: "Children's Modest Fashion",
    vendor: "RashRash Modest",
    tags: ["kids-clothing", "childrens-wear", "girls-fashion", "modest-kids", "islamic-children", "muslim-kids", "eid-outfit", "mosque-clothes"],
    options: ["Size", "Color"],
    variants: [
      { options: ["2-3 Years", "Pink"], price: "69.00", sku: "KDS-PNK-2T", inventoryQty: 10 },
      { options: ["4-5 Years", "Pink"], price: "69.00", sku: "KDS-PNK-4T", inventoryQty: 12 },
      { options: ["6-7 Years", "Pink"], price: "69.00", sku: "KDS-PNK-6T", inventoryQty: 10 },
      { options: ["2-3 Years", "Lavender"], price: "69.00", sku: "KDS-LAV-2T", inventoryQty: 8 },
      { options: ["4-5 Years", "Lavender"], price: "69.00", sku: "KDS-LAV-4T", inventoryQty: 10 },
      { options: ["6-7 Years", "Lavender"], price: "69.00", sku: "KDS-LAV-6T", inventoryQty: 9 },
      { options: ["8-9 Years", "Mint Green"], price: "69.00", sku: "KDS-MNT-8T", inventoryQty: 7 },
      { options: ["10-12 Years", "Mint Green"], price: "69.00", sku: "KDS-MNT-10T", inventoryQty: 6 },
    ],
    seoTitle: "Islamic Children's Clothing Set | Modest Girls Outfit | Muslim Kids",
    seoDescription: "Adorable modest clothing set for Muslim girls. Tunic, pants, mini hijab & accessories. Comfortable, durable, machine washable. Ages 2T-12."
  },
  {
    title: "Men's Thobe - Traditional Saudi Style White Robe",
    descriptionHtml: `<h2>Authentic Saudi Thobe for Muslim Men</h2>
<p>Our <strong>premium men's thobe</strong> is crafted with the finest materials to provide comfort and elegance for daily wear, prayers, and special occasions.</p>
<h3>Traditional Design:</h3>
<ul>
<li><strong>Classic white color:</strong> Traditional and versatile</li>
<li><strong>Full-length cut:</strong> Ankle-length for proper coverage</li>
<li><strong>Long sleeves:</strong> Full arm coverage</li>
<li><strong>Button placket:</strong> Front opening with quality buttons</li>
<li><strong>Side pockets:</strong> Practical storage</li>
</ul>
<h3>Premium Fabric:</h3>
<ul>
<li><strong>100% cotton:</strong> Breathable and comfortable</li>
<li><strong>Lightweight weave:</strong> Perfect for hot climates</li>
<li><strong>Wrinkle-resistant:</strong> Stays crisp all day</li>
<li><strong>Durable:</strong> Maintains quality after many washes</li>
</ul>
<h3>When to Wear:</h3>
<ul>
<li>Daily wear for work and home</li>
<li>Friday prayers (Jumu'ah)</li>
<li>Eid celebrations</li>
<li>Taraweeh during Ramadan</li>
<li>Weddings and special occasions</li>
<li>Umrah and Hajj pilgrimages</li>
</ul>
<h3>Size Information:</h3>
<p>Available in sizes 48-64 (Saudi sizing). Please measure your height and chest for the best fit.</p>
<p><em>"Excellent quality thobe. The fabric is substantial but breathable. Fits perfectly according to the size guide." - Ahmed K.</em></p>`,
    productType: "Men's Islamic Clothing",
    vendor: "RashRash Modest",
    tags: ["thobe", "thawb", "kandura", "dishdasha", "mens-islamic", "muslim-men", "ramadan", "eid", "prayer-clothes", "white-robe"],
    options: ["Size"],
    variants: [
      { options: ["52 (Small)"], price: "159.00", sku: "THB-52", inventoryQty: 15 },
      { options: ["54 (Medium)"], price: "159.00", sku: "THB-54", inventoryQty: 20 },
      { options: ["56 (Large)"], price: "159.00", sku: "THB-56", inventoryQty: 18 },
      { options: ["58 (XL)"], price: "159.00", sku: "THB-58", inventoryQty: 15 },
      { options: ["60 (2XL)"], price: "159.00", sku: "THB-60", inventoryQty: 12 },
    ],
    seoTitle: "Men's Thobe Saudi Style | Traditional Islamic White Robe | Muslim Men",
    seoDescription: "Premium Saudi style thobe for men. 100% cotton, lightweight & comfortable. Perfect for prayers, Eid & daily wear. Sizes 48-64."
  },
  {
    title: "Prayer Rug - Premium Velvet Islamic Prayer Mat",
    descriptionHtml: `<h2>Luxurious Velvet Prayer Mat for Daily Salah</h2>
<p>Enhance your daily prayers with our <strong>premium velvet prayer rug</strong>. The plush texture and beautiful design create a peaceful space for your connection with Allah.</p>
<h3>Premium Features:</h3>
<ul>
<li><strong>Thick velvet pile:</strong> Cushioned comfort for knees and forehead</li>
<li><strong>Non-slip backing:</strong> Stays in place on any surface</li>
<li><strong>Intricate embroidery:</strong> Mihrab design with Islamic geometric patterns</li>
<li><strong>Generous size:</strong> 110cm x 70cm - comfortable for all body types</li>
<li><strong>Lightweight:</strong> Easy to carry for travel</li>
</ul>
<h3>Perfect For:</h3>
<ul>
<li>Daily prayers at home</li>
<li>Office prayer room</li>
<li>Mosque use</li>
<li>Travel and Umrah/Hajj</li>
<li>Eid and Ramadan gifts</li>
<li>Wedding gifts for Muslim couples</li>
</ul>
<h3>Quality Construction:</h3>
<p>The velvet surface is soft yet durable. The backing is made of high-quality material that prevents slipping on tile, carpet, or hardwood floors.</p>
<h3>Easy Care:</h3>
<p>Shake out regularly. Spot clean with mild soap when needed. Air dry completely.</p>
<p><em>"This prayer mat is so comfortable, my knees don't hurt anymore during long prayers. The quality is excellent." - Yusuf M.</em></p>`,
    productType: "Islamic Prayer Accessories",
    vendor: "RashRash Modest",
    tags: ["prayer-rug", "sajjada", "prayer-mat", "islamic-accessories", "salah", "ramadan", "eid-gift", "muslim-home", "wedding-gift"],
    options: ["Color"],
    variants: [
      { options: ["Midnight Blue"], price: "49.00", sku: "RUG-BLU", inventoryQty: 30 },
      { options: ["Forest Green"], price: "49.00", sku: "RUG-GRN", inventoryQty: 25 },
      { options: ["Deep Burgundy"], price: "49.00", sku: "RUG-BUR", inventoryQty: 28 },
      { options: ["Royal Purple"], price: "49.00", sku: "RUG-PUR", inventoryQty: 22 },
      { options: ["Classic Red"], price: "49.00", sku: "RUG-RED", inventoryQty: 20 },
    ],
    seoTitle: "Premium Velvet Prayer Rug | Islamic Prayer Mat | Muslim Gift",
    seoDescription: "Luxurious velvet prayer mat with non-slip backing. Thick cushioned pile, 110x70cm. Perfect for daily prayers, travel & gifts. Beautiful mihrab design."
  },
  {
    title: "Tasbeeh Prayer Beads - 99 Bead Misbaha Crystal",
    descriptionHtml: `<h2>Exquisite Crystal Tasbeeh for Dhikr</h2>
<p>Our <strong>handcrafted 99-bead tasbeeh</strong> is a beautiful tool for your daily dhikr and remembrance of Allah. Each bead is carefully selected for quality and beauty.</p>
<h3>Product Details:</h3>
<ul>
<li><strong>99 beads:</strong> Traditional count for tasbeeh, tahmeed, and takbeer</li>
<li><strong>Crystal beads:</strong> Premium quality with beautiful clarity</li>
<li><strong>Decorative tassel:</strong> Elegant silver or gold accents</li>
<li><strong>Bead size:</strong> 8mm - comfortable to hold</li>
<li><strong>Overall length:</strong> 35cm including tassel</li>
</ul>
<h3>Uses:</h3>
<ul>
<li>Daily dhikr after prayers</li>
<li>Saying SubhanAllah, Alhamdulillah, Allahu Akbar</li>
<li>Meditation and mindfulness</li>
<li>Stress relief</li>
<li>Islamic gift for any occasion</li>
</ul>
<h3>Benefits of Dhikr:</h3>
<p>The Prophet Muhammad (peace be upon him) said: "The example of the one who remembers his Lord versus the one who does not is like the example of the living and the dead." (Bukhari)</p>
<h3>Gift Ready:</h3>
<p>Comes in a beautiful velvet pouch, perfect for gifting to family and friends.</p>
<p><em>"Bought this as a gift for my father and he loves it. The beads are smooth and the quality is outstanding." - Omar S.</em></p>`,
    productType: "Islamic Spiritual Items",
    vendor: "RashRash Modest",
    tags: ["tasbeeh", "misbaha", "prayer-beads", "dhikr", "islamic-gift", "spiritual", "ramadan", "eid-gift"],
    options: ["Bead Color"],
    variants: [
      { options: ["Clear Crystal"], price: "35.00", sku: "TSB-CLR", inventoryQty: 40 },
      { options: ["Amber Crystal"], price: "35.00", sku: "TSB-AMB", inventoryQty: 35 },
      { options: ["Black Onyx"], price: "39.00", sku: "TSB-BLK", inventoryQty: 30 },
      { options: ["Rose Quartz"], price: "39.00", sku: "TSB-ROS", inventoryQty: 28 },
      { options: ["Turquoise Blue"], price: "39.00", sku: "TSB-TUR", inventoryQty: 32 },
    ],
    seoTitle: "Tasbeeh Prayer Beads 99 | Crystal Misbaha | Islamic Dhikr Gift",
    seoDescription: "Handcrafted 99-bead crystal tasbeeh for dhikr. Premium quality with decorative tassel. Perfect for daily remembrance & Islamic gifts. Velvet pouch included."
  },
  {
    title: "Ramadan Lantern - Traditional Fanoos LED Light",
    descriptionHtml: `<h2>Authentic Egyptian Fanoos for Ramadan Decorations</h2>
<p>Bring the spirit of Ramadan into your home with our <strong>beautiful traditional fanoos lantern</strong>. This stunning piece combines centuries-old design with modern LED technology.</p>
<h3>Features:</h3>
<ul>
<li><strong>Authentic design:</strong> Based on traditional Egyptian fanoos patterns</li>
<li><strong>Intricate metalwork:</strong> Hand-finished details with geometric patterns</li>
<li><strong>Colorful glass panels:</strong> Creates beautiful light patterns</li>
<li><strong>LED light included:</strong> Safe, cool-touch operation</li>
<li><strong>Battery operated:</strong> 3 AA batteries (not included)</li>
<li><strong>Size:</strong> 30cm height - impressive centerpiece size</li>
</ul>
<h3>Ramadan Tradition:</h3>
<p>The fanoos (fanous) has been a symbol of Ramadan in Egypt since the Fatimid era. It represents the joy and light of the holy month.</p>
<h3>Perfect For:</h3>
<ul>
<li>Ramadan home decorations</li>
<li>Iftar table centerpiece</li>
<li>Eid celebrations</li>
<li>Islamic home decor year-round</li>
<li>Ramadan gifts and Eid presents</li>
</ul>
<h3>Safety:</h3>
<p>LED light stays cool to the touch, making it safe for homes with children. No fire hazard like traditional candles.</p>
<p><em>"This fanoos is absolutely beautiful! It creates such a warm atmosphere during Ramadan. My kids love it." - Layla H.</em></p>`,
    productType: "Ramadan Decorations",
    vendor: "RashRash Modest",
    tags: ["ramadan", "fanoos", "lantern", "islamic-decor", "eid", "iftar", "decoration", "led-light", "home-decor", "muslim-home"],
    options: ["Color"],
    variants: [
      { options: ["Gold & Multicolor"], price: "59.00", sku: "FNS-GLD", inventoryQty: 25 },
      { options: ["Silver & Blue"], price: "59.00", sku: "FNS-SLV", inventoryQty: 20 },
      { options: ["Bronze & Amber"], price: "59.00", sku: "FNS-BRZ", inventoryQty: 18 },
    ],
    seoTitle: "Ramadan Lantern Fanoos | Traditional LED Light | Islamic Decor",
    seoDescription: "Authentic Egyptian fanoos lantern with LED light. Traditional design, 30cm height. Perfect for Ramadan decoration, Eid & Islamic home decor."
  },
  {
    title: "Dates Gift Box - Premium Medjool Dates Ramadan Gift",
    descriptionHtml: `<h2>Premium Medjool Dates - The Perfect Ramadan Gift</h2>
<p>Break your fast with the finest <strong>premium Medjool dates</strong> from our carefully curated collection. Dates are a sunnah food and the traditional way to break the Ramadan fast.</p>
<h3>About Our Dates:</h3>
<ul>
<li><strong>Origin:</strong> Premium Palestinian and Saudi Medjool varieties</li>
<li><strong>Size:</strong> Large to jumbo grade - plump and juicy</li>
<li><strong>Freshness:</strong> Harvested and packed within the season</li>
<li><strong>Weight:</strong> 1kg (2.2 lbs) per box</li>
</ul>
<h3>Gift Box Includes:</h3>
<ul>
<li>Premium dates in elegant packaging</li>
<li>Beautiful Ramadan-themed gift box</li>
<li>Greeting card for your personal message</li>
<li>Optional decorative ribbon</li>
</ul>
<h3>Health Benefits:</h3>
<p>Dates are rich in fiber, potassium, and natural sugars - perfect for quick energy after fasting. They're also mentioned in the Quran and Hadith as blessed food.</p>
<h3>Perfect For:</h3>
<ul>
<li>Personal iftar table</li>
<li>Ramadan gifts for family</li>
<li>Eid presents</li>
<li>Wedding favors</li>
<li>Corporate Ramadan gifts</li>
<li>Charity donations</li>
</ul>
<p><em>"The best dates I've ever tasted! Soft, sweet, and absolutely delicious. Will definitely order again." - Fatima A.</em></p>`,
    productType: "Ramadan Food Gifts",
    vendor: "RashRash Modest",
    tags: ["dates", "medjool", "ramadan", "iftar", "eid-gift", "food-gift", "islamic-food", "sunnah", "healthy-snack"],
    options: ["Grade"],
    variants: [
      { options: ["Premium (1kg)"], price: "49.00", sku: "DAT-PRM-1KG", inventoryQty: 50 },
      { options: ["Jumbo (1kg)"], price: "69.00", sku: "DAT-JUM-1KG", inventoryQty: 35 },
      { options: ["Mixed Variety (1.5kg)"], price: "89.00", sku: "DAT-MIX-15KG", inventoryQty: 25 },
    ],
    seoTitle: "Premium Medjool Dates Gift Box | Ramadan Iftar Dates | Eid Gift",
    seoDescription: "Premium Palestinian & Saudi Medjool dates. 1kg gift box perfect for Ramadan iftar, Eid gifts & special occasions. Fresh, plump & delicious."
  },
  {
    title: "Islamic Wall Art - Bismillah Arabic Calligraphy Canvas",
    descriptionHtml: `<h2>Stunning Islamic Calligraphy for Your Home</h2>
<p>Transform your living space with our <strong>beautiful Bismillah wall art</strong>. This elegant piece features traditional Arabic calligraphy on premium canvas.</p>
<h3>Artwork Details:</h3>
<ul>
<li><strong>Script:</strong> Classic Thuluth calligraphy style</li>
<li><strong>Text:</strong> "Bismillah ir-Rahman ir-Rahim" (In the name of Allah, the Most Gracious, the Most Merciful)</li>
<li><strong>Canvas material:</strong> High-quality artist-grade canvas</li>
<li><strong>Ink:</strong> UV-resistant archival ink - won't fade</li>
<li><strong>Size options:</strong> 50x70cm, 70x100cm</li>
</ul>
<h3>Styling:</h3>
<p>The minimalist design with gold/white color scheme complements any home decor - from modern to traditional. Perfect for:</p>
<ul>
<li>Living room centerpiece</li>
<li>Entryway welcome piece</li>
<li>Bedroom decor</li>
<li>Office inspiration</li>
<li>Masala/prayer room</li>
</ul>
<h3>Ready to Hang:</h3>
<p>The canvas comes stretched on a wooden frame with hanging hardware pre-installed.</p>
<h3>Meaningful Gift:</h3>
<p>Perfect for housewarming, wedding gifts, Eid presents, or any special occasion for Muslims.</p>
<p><em>"Absolutely gorgeous! The calligraphy is elegant and the quality is museum-grade. Everyone who visits comments on it." - Amina R.</em></p>`,
    productType: "Islamic Home Decor",
    vendor: "RashRash Modest",
    tags: ["islamic-art", "wall-art", "calligraphy", "bismillah", "arabic-art", "home-decor", "muslim-home", "eid-gift", "wedding-gift"],
    options: ["Size", "Frame Color"],
    variants: [
      { options: ["50x70cm", "Gold Frame"], price: "89.00", sku: "ART-50-GLD", inventoryQty: 15 },
      { options: ["50x70cm", "Black Frame"], price: "89.00", sku: "ART-50-BLK", inventoryQty: 15 },
      { options: ["70x100cm", "Gold Frame"], price: "129.00", sku: "ART-70-GLD", inventoryQty: 10 },
      { options: ["70x100cm", "Black Frame"], price: "129.00", sku: "ART-70-BLK", inventoryQty: 10 },
      { options: ["70x100cm", "White Frame"], price: "129.00", sku: "ART-70-WHT", inventoryQty: 8 },
    ],
    seoTitle: "Islamic Wall Art Bismillah | Arabic Calligraphy Canvas | Muslim Home",
    seoDescription: "Elegant Bismillah Arabic calligraphy canvas art. Premium quality, UV-resistant ink. Ready to hang. Perfect for Muslim home decor & Islamic gifts."
  },
  {
    title: "Quran Stand - Wooden Rehal for Holy Book Reading",
    descriptionHtml: `<h2>Elegant Wooden Rehal for Quran Reading</h2>
<p>Honor your Quran reading with our <strong>beautifully crafted wooden rehal</strong> (Quran stand). This traditional piece adds dignity to your daily recitation and protects your Quran.</p>
<h3>Craftsmanship:</h3>
<ul>
<li><strong>Premium wood:</strong> Solid sheesham or walnut wood</li>
<li><strong>Hand-carved details:</strong> Intricate Islamic geometric patterns</li>
<li><strong>Foldable design:</strong> Easy to store when not in use</li>
<li><strong>Book rest:</strong> Holds Quran at comfortable reading angle</li>
<li><strong>Page holders:</strong> Keeps pages from turning</li>
</ul>
<h3>Dimensions:</h3>
<ul>
<li>Open: 35cm x 25cm x 20cm (L x W x H)</li>
<li>Folded: 35cm x 25cm x 3cm</li>
<li>Weight: 800g</li>
</ul>
<h3>Benefits of Using a Rehal:</h3>
<ul>
<li>Elevates the Quran above ground level (sign of respect)</li>
<li>Ergonomic reading angle - reduces neck strain</li>
<li>Protects Quran pages from damage</li>
<li>Creates a dedicated space for reading</li>
<li>Beautiful addition to Islamic home decor</li>
</ul>
<h3>Perfect For:</h3>
<ul>
<li>Daily Quran reading</li>
<li>Taraweeh prayers during Ramadan</li>
<li>Quran classes and study circles</li>
<li>Mosque libraries</li>
<li>Meaningful Islamic gift</li>
</ul>
<p><em>"Beautiful craftsmanship! The wood grain is lovely and the carving is intricate. Makes my daily reading much more comfortable." - Ibrahim K.</em></p>`,
    productType: "Islamic Religious Items",
    vendor: "RashRash Modest",
    tags: ["quran-stand", "rehal", "rahle", "islamic-woodwork", "quran-accessories", "ramadan", "prayer", "muslim-home", "eid-gift"],
    options: ["Wood Type"],
    variants: [
      { options: ["Sheesham Wood"], price: "75.00", sku: "REH-SHE", inventoryQty: 20 },
      { options: ["Walnut Wood"], price: "89.00", sku: "REH-WAL", inventoryQty: 15 },
      { options: ["Rosewood"], price: "95.00", sku: "REH-ROS", inventoryQty: 12 },
    ],
    seoTitle: "Quran Stand Rehal | Wooden Holy Book Holder | Islamic Gift",
    seoDescription: "Handcrafted wooden Quran stand (rehal) with Islamic carvings. Foldable, solid sheesham wood. Perfect for daily reading, Ramadan & Islamic gifts."
  },
];

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const results = {
    success: [] as string[],
    failed: [] as { title: string; error: string }[],
  };

  // Get location ID
  const locationResponse = await admin.graphql(`
    query GetLocations {
      locations(first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }
  `);
  const locationData = await locationResponse.json();
  const locationId = locationData?.data?.locations?.edges?.[0]?.node?.id;

  if (!locationId) {
    return json({ error: "No location found" }, { status: 500 });
  }

  for (const product of richProducts) {
    try {
      const variants = product.variants.map(v => ({
        price: v.price,
        sku: v.sku,
        options: v.options,
        inventoryQuantities: {
          availableQuantity: v.inventoryQty,
          locationId: locationId,
        },
      }));

      const response = await admin.graphql(`
        mutation productCreate($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
              title
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        variables: {
          input: {
            title: product.title,
            descriptionHtml: product.descriptionHtml,
            productType: product.productType,
            vendor: product.vendor,
            tags: product.tags,
            status: "ACTIVE",
            options: product.options,
            variants,
            seo: {
              title: product.seoTitle,
              description: product.seoDescription,
            },
          },
        },
      });

      const data = await response.json();

      if (data?.data?.productCreate?.userErrors?.length > 0) {
        results.failed.push({
          title: product.title,
          error: data.data.productCreate.userErrors.map((e: any) => e.message).join(", "),
        });
      } else {
        results.success.push(product.title);
      }

      // Delay to avoid rate limits
      await new Promise(r => setTimeout(r, 300));
    } catch (error) {
      results.failed.push({
        title: product.title,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return json({
    shop: session.shop,
    success: results.success.length,
    failed: results.failed.length,
    createdProducts: results.success,
    failedProducts: results.failed,
  });
};
