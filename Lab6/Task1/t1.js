async function getUser() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users/1");

        if (!response.ok) {
            throw new Error("Failed to fetch user data");
        }

        const user = await response.json();

        return user;
    } catch (error) {
        throw new Error("Error fetching user: " + error.message);
    }
}

async function main() {
    try {
        const user = await getUser();
        console.log("User fetched successfully:");
        console.log(user);
    } catch (error) {
        console.log(error.message);
    }
}

main();
