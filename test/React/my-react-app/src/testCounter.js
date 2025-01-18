const fs = require('fs').promises;
const path = require('path');
const { exec } = require("child_process");

// Function to count test cases by browser
async function countTestCasesByBrowser(filePath) {
    try {
        const content = await fs.readFile(filePath, "utf8");

        // Regex to find the @DataProvider block (handles multiline content)
        const dataProviderRegex =
            /@DataProvider\s*\(.*?\)\s*public\s*Object\[\]\[\]\s*\w+\s*\(\)\s*\{([\s\S]*?)\};/;
        const match = content.match(dataProviderRegex);

        if (match) {
            const dataProviderContent = match[1];

            // Regex to find all test cases within the 2D array
            const testCaseRegex = /\{["'](chrome|firefox|edge)["'],/g;
            const browserCounts = { chrome: 0, firefox: 0, edge: 0 };

            let testCaseMatch;
            while ((testCaseMatch = testCaseRegex.exec(dataProviderContent)) !== null) {
                const browser = testCaseMatch[1].toLowerCase();
                if (browserCounts[browser] !== undefined) {
                    browserCounts[browser]++;
                }
            }

            return browserCounts;
        } else {
            console.error("No DataProvider method found in the file.");
            return { chrome: 0, firefox: 0, edge: 0 };
        }
    } catch (error) {
        console.error(`Error reading or parsing the file: ${error.message}`);
        return { chrome: 0, firefox: 0, edge: 0 };
    }
}

// Function to calculate replicas based on the number of tests
function calculateReplicas(testCount) {
    return Math.ceil(testCount / 3); // Add 1 replica for every 3 tests
}

// Function to update the YAML file
async function updateKubernetesDeployment(deploymentFilePath, replicas) {
    try {
        const deploymentContent = await fs.readFile(deploymentFilePath, "utf8");

        // Regex to match the replicas field in the deployment YAML
        const replicasRegex = /replicas:\s*\d+/;
        const updatedContent = deploymentContent.replace(replicasRegex, `replicas: ${replicas}`);

        // Write the updated content back to the deployment file
        await fs.writeFile(deploymentFilePath, updatedContent, "utf8");
        console.log(`Updated replicas to ${replicas} in ${path.basename(deploymentFilePath)}.`);

        return true;
    } catch (error) {
        console.error(`Error updating deployment file: ${error.message}`);
        return false;
    }
}

// Function to apply the YAML file using kubectl
function applyKubernetesDeployment(deploymentFilePath) {
    return new Promise((resolve, reject) => {
        exec(`kubectl apply -f ${deploymentFilePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error applying ${deploymentFilePath}: ${stderr}`);
                return reject(error);
            }
            console.log(`Applied ${deploymentFilePath} successfully: ${stdout}`);
            resolve(stdout);
        });
    });
}

async function main() {
    const testCaseFilePath = '../../../registerTestCase.java'; // Path to your Java test file
    const deploymentDir = '../../../'; // Directory where your deployment files are located

    const deploymentPaths = {
        chrome: path.join(deploymentDir, "selenium-node-chrome-deployment.yaml"),
        firefox: path.join(deploymentDir, "selenium-node-firefox-deployment.yaml"),
        edge: path.join(deploymentDir, "selenium-node-edge-deployment.yaml")
    };

    // Step 1: Count test cases by browser
    const browserCounts = await countTestCasesByBrowser(testCaseFilePath);
    console.log(`Test case counts by browser: ${JSON.stringify(browserCounts, null, 2)}`);

    // Step 2: Update and apply Kubernetes deployments for each browser
    const updateAndApplyPromises = Object.entries(deploymentPaths).map(
        async ([browser, deploymentFilePath]) => {
            const testCount = browserCounts[browser] || 0;
            const replicas = calculateReplicas(testCount); // Calculate replicas
            if (replicas > 0) {
                const updated = await updateKubernetesDeployment(deploymentFilePath, replicas);
                if (updated) {
                    await applyKubernetesDeployment(deploymentFilePath);
                }
            } else {
                console.log(`No test cases for ${browser}. Deployment not updated.`);
            }
        }
    );

    await Promise.all(updateAndApplyPromises);
}



// Run the script
main().catch((error) => {
    console.error(`Error in script execution: ${error.message}`);
});
