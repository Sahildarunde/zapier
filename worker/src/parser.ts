export function parse(text: string, values: any, startDelimeter = "{", endDelimeter = "}") {
    let startIndex = 0;
    let endIndex = 1;
    let finalString = "";

    while (endIndex < text.length) {
        if (text[startIndex] === startDelimeter) {
            let endPoint = startIndex + 1;
            while (endPoint < text.length && text[endPoint] !== endDelimeter) {
                endPoint++;
            }

            if (endPoint < text.length) {  // Ensure we found a closing delimiter
                // Extract the key path and trim any extra spaces
                let stringHoldingValue = text.slice(startIndex + 1, endPoint).trim();
                const keys = stringHoldingValue.split(".");
                
                // Access nested value based on keys
                let localValues = values;
                for (let i = 0; i < keys.length; i++) {
                    localValues = localValues?.[keys[i]];
                    if (localValues === undefined) break;  // Exit loop if any key is not found
                }

                finalString += localValues !== undefined ? localValues : `{${stringHoldingValue}}`;
                startIndex = endPoint + 1;
                endIndex = startIndex;
            }
        } else {
            finalString += text[startIndex];
            startIndex++;
            endIndex++;
        }
    }

    // Add any remaining characters
    if (startIndex < text.length) {
        finalString += text.slice(startIndex);
    }

    return finalString;
}














// export function parse(text: string, values: any, startDelimeter = "{", endDelimeter = "}") {
//     // You received {comment.amount} momey from {comment.link}
//     let startIndex = 0;
//     let endIndex = 1;

//     console.log("text " +text)
//     console.log("values" +JSON.stringify(values))

//     let finalString = "";
//     while (endIndex < text.length) {
//         if (text[startIndex] === startDelimeter) {
//             let endPoint = startIndex + 2;
//             while (text[endPoint] !== endDelimeter) {
//                 endPoint++;
//             }
//             // 
//             let stringHoldingValue = text.slice(startIndex + 1, endPoint);
//             const keys = stringHoldingValue.split(".");
//             let localValues = {
//                 ...values
//             }
//             for (let i = 0; i < keys.length; i++) {
//                 if (typeof localValues === "string") {
//                     localValues = JSON.parse(localValues);
//                 }
//                 localValues = localValues[keys[i]];
//             }
//             finalString += localValues;
//             startIndex = endPoint + 1;
//             endIndex = endPoint + 2;
//         } else {
//             finalString += text[startIndex];
//             startIndex++;
//             endIndex++;
//         }
//     }
//     if (text[startIndex]) {
//         finalString += text[startIndex]
//     }

//     console.log(finalString);
//     return finalString;
// }