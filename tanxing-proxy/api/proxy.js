export default async function handler(req, res) {
  // 1. 设置跨域头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 2. 健康检查
  if (!req.body || req.method === 'GET') {
      return res.status(200).json({ 
          status: "ok", 
          message: "Tanxing Proxy is Running!",
          url: req.url 
      });
  }

  try {
    const { appId, accessToken, appKey, appSecret, skus } = req.body;
    // 兼容：既支持 URL 路径判断，也支持 Query 参数判断 (?endpoint=inventory)
    // 这是为了解决 Vercel 路由重写失败时的 404 问题
    const urlStr = req.url || '';
    const queryEndpoint = req.query?.endpoint || '';
    
    // --- 模拟库存返回 ---
    if (urlStr.includes('inventory') || queryEndpoint === 'inventory') {
      const mockData = (skus || []).map(sku => ({
        sku: sku,
        product_sku: sku,
        productName: `[Proxy] ${sku}`,
        cn_name: `[Proxy] ${sku}`,
        fbaStock: Math.floor(Math.random() * 200) + 20,
        stock_quantity: Math.floor(Math.random() * 200) + 20,
        localStock: 0
      }));
      // 模拟一个新品
      mockData.push({
          sku: "PROXY-NEW-001", product_sku: "PROXY-NEW-001",
          productName: "代理服务器发现的新品", cn_name: "代理服务器发现的新品",
          fbaStock: 999, stock_quantity: 999, localStock: 0
      });
      return res.status(200).json(mockData);
    }

    // --- 模拟销量返回 ---
    if (urlStr.includes('sales') || queryEndpoint === 'sales') {
      const mockData = (skus || []).map(sku => ({
        sku: sku, product_sku: sku,
        avgDailySales: (Math.random() * 10).toFixed(1),
        avg_sales_30d: (Math.random() * 10).toFixed(1)
      }));
      return res.status(200).json(mockData);
    }

    res.status(404).json({ error: "Unknown endpoint", receivedUrl: urlStr });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}