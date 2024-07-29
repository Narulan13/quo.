function sendCheckboxes() {
    const form = document.getElementById('searchByTags');
    const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
    const checkedValues = Array.from(checkboxes).map(cb => cb.value);

    fetch('/searchByTags', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ checkedValues })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}