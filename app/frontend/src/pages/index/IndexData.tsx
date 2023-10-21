import { useState } from "react";
import { TextField } from "@fluentui/react";
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import { SearchClient } from "@azure/search-documents";
import { Buffer } from "buffer";

const IndexData = () => {
    const [url, setUrl] = useState<string>("");

    const onUrlChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setUrl(newValue || "");
    };

    const indexFiles = async (url: string) => {
        const blobServiceClient = new BlobServiceClient(
            `https://strob2nleooqzme.blob.core.windows.net?sv=2022-11-02&ss=bfqt&srt=o&sp=rwdlacupiytfx&se=2023-08-25T11:40:02Z&st=2023-08-25T03:40:02Z&spr=https&sig=0FpoEuMVYscQ0vUgPmE%2FLnhuZ7I5p%2B06qEyZs%2Fh7PNc%3D`
        );
        const containerClient = blobServiceClient.getContainerClient("content");

        const searchClient = new SearchClient(
            "https://gptkb-rob2nleooqzme.search.windows.net",
            "testingindex2",
            new AzureKeyCredential("xTWI3OJ3Rgd9fQChHCR6ciLFLBTJj46I0eHGYfRvfoAzSeDwL5uY")
        );
        const data = Buffer.from(
            await fetch(`http://localhost:9000/api/render?url=${url}`, {
                method: "GET"
            }).then(res => res.arrayBuffer())
        );
        const blockBlobClient = containerClient.getBlockBlobClient("nba-stats-6.pdf");
        const response = await blockBlobClient.uploadData(data, {
            blobHTTPHeaders: {
                blobContentType: "application/pdf"
            }
        });

        const endpoint = "https://cog-fr-rob2nleooqzme.cognitiveservices.azure.com/";
        const key = "83802fadf4d64b8eb7e0c01acfe5d1ac";

        var wholeContent = "";

        const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));

        const poller = await client.beginAnalyzeDocumentFromUrl("prebuilt-read", response._response.request.url);

        const { content, pages, languages } = await poller.pollUntilDone();

        if (!pages || pages.length <= 0) {
            console.log("No pages were extracted from the document.");
        } else {
            // console.log("Pages:");
            for (const page of pages) {
                // console.log("- Page", page.pageNumber, `(unit: ${page.unit})`);
                // console.log(`  ${page.width}x${page.height}, angle: ${page.angle}`);
                // console.log(
                //   `  ${page.lines && page.lines.length} lines, ${
                //     page.words && page.words.length
                //   } words`
                // );

                if (page.lines && page.lines.length > 0) {
                    // console.log("  Lines:");

                    for (const line of page.lines) {
                        wholeContent += `${line.content} `;
                    }
                }
            }
        }

        const uploadResult = await searchClient.uploadDocuments([
            // JSON objects matching the shape of the client's index
            {
                id: url.replace("https://www.", "").replace(".", "-").replace("/", "-"),
                content: wholeContent,
                category: "null",
                sourcepage: url.replace("https://www.", "").replace(".", "-").replace("/", "-"),
                sourcefile: url.replace("https://www.", "").replace(".", "-").replace("/", "-")
            }
        ]);
        for (const result of uploadResult.results) {
            console.log(`Uploaded ${result.key}; succeeded? ${result.succeeded}`);
        }
    };

    return (
        <div>
            <TextField defaultValue={url} autoAdjustHeight onChange={onUrlChange} />
            <button onClick={() => indexFiles(url)}>Index</button>
        </div>
    );
};

export default IndexData;
