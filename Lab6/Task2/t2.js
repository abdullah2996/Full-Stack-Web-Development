function getUser() {
    return fetch("https://jsonplaceholder.typicode.com/users/1")
        .then(response => {
            if (!response.ok) {
                throw new Error("User details not found");
            }
            return response.json();
        });
}

function getPost() {
    return fetch("https://jsonplaceholder.typicode.com/posts/1")
        .then(response => {
            if (!response.ok) {
                throw new Error("Post details not found");
            }
            return response.json();
        });
}

Promise.all([getUser(), getPost()])
    .then(([user, post]) => {
        if (user && user.id && user.name && post && post.id && post.title) {
            console.log("Both promises resolved successfully.");
            console.log("User Details:", user);
            console.log("Post Details:", post);
        } else {
            throw new Error("Invalid details received from API");
        }
    })
    .catch(error => {
        console.log("Promise rejected:", error.message);
    });