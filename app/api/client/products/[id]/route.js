import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { verifyToken } from "../../../../lib/auth";

export async function GET(req, { params }) {
  try {
const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID missing" },
        { status: 400 }
      );
    }

     /* ===== AUTH ===== */
       let decoded;
       try {
         decoded = verifyToken(req);
       } catch (err) {
         console.error("Auth error:", err.message);
         return NextResponse.json(
           { error: "Unauthorized" },
           { status: 401 }
         );
       }
   
       const { companyId} = decoded; // TODO: get from auth/session

    /* ================= PRODUCT (BASE + COMPANY PRICE) ================= */
    const [[product]] = await db.query(
      `
      SELECT 
        p.id,
        p.product_name,
        p.description,
        p.barcode,
        p.size,
        p.weight,
        p.sku,
        p.base_price,
        COALESCE(cpp.custom_price, p.base_price) AS final_price,
        p.featured_image,
        p.hsn,
        p.stock_qty
      FROM products p
      LEFT JOIN company_product_pricing cpp
        ON cpp.product_id = p.id
       AND cpp.company_id = ?
      WHERE p.id = ?
      LIMIT 1
      `,
      [companyId, productId]
    );

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    /* ================= CATALOG ================= */
    const [[catalog]] = await db.query(
      `
      SELECT c.name
      FROM product_catalog_map pcm
      JOIN catalogs c ON c.id = pcm.catalog_id
      WHERE pcm.product_id = ?
      LIMIT 1
      `,
      [productId]
    );

    /* ================= GALLERY ================= */
    const [images] = await db.query(
      `
      SELECT image_url
      FROM product_gallery_images
      WHERE product_id = ?
      ORDER BY id ASC
      `,
      [productId]
    );

    const [[catalogMap]] = await db.query(
  `
  SELECT catalog_id 
  FROM product_catalog_map 
  WHERE product_id = ?
  LIMIT 1
  `,
  [productId]
);

    return NextResponse.json({
      id: product.id,
      title: product.product_name,
      subtitle: "",
catalogId: catalogMap?.catalog_id || null,
      breadcrumb: {
        dashboard: "Home",
        products: "Products",
        catalogName: catalog?.name || "Catalog",
        productName: product.product_name,
      },

      description: product.description || "No description available",
      price: product.final_price,   // company price OR base price
      base_price: product.base_price, // optional (for admin/debug)
      sku:product.sku,
      hsn: product.hsn,
      stock_qty:product.stock_qty,
      images: images.length
        ? images.map(i => i.image_url)
        : [product.featured_image],

      details: {
        code: product.barcode,
        size: product.size,
        weight: product.weight,
      }
    });

  } catch (error) {
    console.error("Product Details API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product details" },
      { status: 500 }
    );
  }
}
