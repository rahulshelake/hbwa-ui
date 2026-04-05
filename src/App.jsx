import { useState } from "react";

function App() {
  const [mode, setMode] = useState("dealer");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const API_BASE =
    "https://genai-chat-api-rs-a3g3h3d7b7g0c4cz.centralindia-01.azurewebsites.net";

  const uploadImage = async () => {
    if (!file) {
      alert("Select image file");
      return;
    }

    setStatus("Uploading image...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/upload-image`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      setImageUrl(data.imageUrl);
      setStatus("Image uploaded and AI extraction completed ✅");
      setExtracted(data);

      try {
        let parsed;

try {
  parsed = JSON.parse(data.rawResponse);
} catch {
  parsed = {
    vin: "Not detected",
    engineNo: "Not detected",
    invoiceNo: "Not detected",
    partCode: "Not detected",
    raw: data.rawResponse
  };
}
      } catch {
        setExtracted({
          vin: "Parsing failed",
          engineNo: "Parsing failed",
          invoiceNo: "Parsing failed",
          partCode: "Parsing failed",
          raw: data.rawResponse
        });
      }
    } catch (err) {
      console.error(err);
      setStatus("Upload failed ❌");
    }
  };

  const askAI = async () => {
    if (!question.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/ask-rag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question })
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error calling ask-rag");
    }
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>HBWA AI System</h1>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setMode("dealer")}>Dealer</button>
        <button onClick={() => setMode("reviewer")} style={{ marginLeft: 10 }}>
          Reviewer
        </button>
      </div>

      {mode === "dealer" && (
        <div>
          <h2>Dealer Upload</h2>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button onClick={uploadImage} style={{ marginLeft: 10 }}>
            Upload Image
          </button>

          <p>{status}</p>

          {imageUrl && (
            <div style={{ marginTop: 20 }}>
              <h3>Uploaded Image</h3>
              <img
                src={imageUrl}
                alt="uploaded"
                style={{ width: 300, border: "1px solid #ccc" }}
              />
            </div>
          )}

          {extracted && (
  <div style={{ marginTop: 20 }}>
    <h3>Extracted Data</h3>
    <p><b>VIN:</b> {extracted.vin || "Not found"}</p>
    <p><b>Engine No:</b> {extracted.engineNo || "Not found"}</p>
    <p><b>Invoice No:</b> {extracted.invoiceNo || "Not found"}</p>
    <p><b>Part Code:</b> {extracted.partCode || "Not found"}</p>

    <h3>Assessment</h3>
    <p><b>Confidence Score:</b> {extracted.confidenceScore}%</p>
    <p>
      <b>Recommendation:</b>{" "}
      <span
        style={{
          color:
            extracted.recommendation === "Approve"
              ? "green"
              : extracted.recommendation === "Manual Review"
              ? "orange"
              : "red"
        }}
      >
        {extracted.recommendation}
      </span>
    </p>

    <div>
      <b>Fraud Flags:</b>
      {extracted.fraudFlags?.length > 0 ? (
        <ul>
          {extracted.fraudFlags.map((flag, index) => (
            <li key={index}>{flag}</li>
          ))}
        </ul>
      ) : (
        <p>No fraud flags detected</p>
      )}
    </div>
  </div>
)}
        </div>
      )}

      {mode === "reviewer" && (
        <div>
          <h2>Reviewer Panel</h2>

          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask validation question..."
            style={{ width: 350 }}
          />

          <button onClick={askAI} style={{ marginLeft: 10 }}>
            Ask AI
          </button>

          {result && (
  <div style={{ marginTop: 20 }}>
    <p><b>Answer:</b> {result.answer}</p>

    <p><b>Sources:</b></p>
    <pre style={{ whiteSpace: "pre-wrap" }}>
      {JSON.stringify(result.sources, null, 2)}
    </pre>

    {/* ✅ Dynamic values */}
    <p><b>Confidence Score:</b> {result.confidence}%</p>

    <p style={{
      color: result.recommendation === "Auto Approve" ? "green" : "orange"
    }}>
      <b>Recommendation:</b> {result.recommendation}
    </p>

    {result.fraudFlags?.length > 0 && (
      <>
        <p><b>Fraud Flags:</b></p>
        <ul>
          {result.fraudFlags.map((f, i) => (
            <li key={i} style={{ color: "red" }}>{f}</li>
          ))}
        </ul>
      </>
    )}
  </div>
)}
        </div>
      )}
    </div>
  );
}

export default App;