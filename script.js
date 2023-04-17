const { Configuration, OpenAIApi } = require("openai");

const imageInput = document.getElementById("image-input");
const submitButton = document.getElementById("submit-button");
const output = document.getElementById("output");

const apiKey = "<YOUR_API_KEY>";
const configuration = new Configuration({
    apiKey: "<YOUR_OPENAI_API_KEY>",
});

const openai = new OpenAIApi(configuration);

const ChatGPTFunction = async (text) => {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: text,
        temperature: 0.6,
        max_tokens: 1024,
        top_p: 1,
        frequency_penalty: 1,
        presence_penalty: 1,
    });
    return response.data.choices[0].text;
};
submitButton.addEventListener("click", function () {
    if (imageInput.files.length === 0) {
        alert("Please select an image file!");
        return;
    }

    const fileToUpload = imageInput.files[0];
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("language", "eng");
    formData.append("apikey", apiKey);
    formData.append("isOverlayRequired", true);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.ocr.space/parse/image");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                const parsedResults = response["ParsedResults"];
                if (parsedResults !== null) {
                    let outputText = "";
                    parsedResults.forEach(function (parsedResult) {
                        const exitCode = parsedResult["FileParseExitCode"];
                        const parsedText = parsedResult["ParsedText"];
                        const errorMessage = parsedResult["ErrorMessage"];

                        if (+exitCode === 1) {
                            outputText += parsedText + "\n";
                        } else {
                            outputText += "Error: " + errorMessage + "\n";
                        }
                    });
                    output.innerText = outputText;
                } else {
                    output.innerText = "Error: No parsed results found";
                }
            } else {
                output.innerText = "Error: " + xhr.statusText;
            }
        }
    };
    xhr.send(formData);
    // console.log(text)
    setTimeout(function () {
        const text = "Answer this in a direct manner: " + output.innerText.replace(/\s+/g, ' ').trim();
        console.log(text)
        ChatGPTFunction(text).then((response) => {
            console.log(response);
            document.getElementById("output2").textContent = response;
        });
    }, 10000); // delay for 10 seconds (10,000 milliseconds)
});