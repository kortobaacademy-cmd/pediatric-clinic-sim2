// netlify/functions/claude.js
// دالة Serverless بتشتغل على Netlify. مهمتها الوحيدة: تستقبل الطلب من الفرونت إند،
// تحط عليه الـ API key (اللي متخزّن كـ Environment Variable على Netlify ومش ظاهر أبدًا للمتصفح)،
// وتبعته لـ Anthropic API، وترجّع الرد زي ما هو.

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "ANTHROPIC_API_KEY مش متظبطة على السيرفر" }),
    };
  }

  // حماية بسيطة اختيارية: لو عايز تمنع أي حد برة الرابط يستخدم الـ endpoint،
  // ظبط APP_SECRET في Netlify وخلي الفرونت إند يبعته في header.
  const appSecret = process.env.APP_SECRET;
  if (appSecret) {
    const provided = event.headers["x-app-secret"] || event.headers["X-App-Secret"];
    if (provided !== appSecret) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "غير مصرح" }),
      };
    }
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "body غير صالح" }),
    };
  }

  const { system, messages, max_tokens } = payload;
  if (!messages || !Array.isArray(messages)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "messages مطلوبة" }),
    };
  }

  try {
    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: max_tokens || 2000,
        system,
        messages,
      }),
    });

    const data = await apiRes.json();

    return {
      statusCode: apiRes.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message || "حصل خطأ غير متوقع" }),
    };
  }
};
