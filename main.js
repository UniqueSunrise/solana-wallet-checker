document.addEventListener('DOMContentLoaded', () => {
    // Обработчик нажатия на кнопку "Check Balances"
    document.getElementById('check-balances').addEventListener('click', async () => {
        const apiKey = document.getElementById('api-key').value.trim();
        const addresses = document.getElementById('wallet-addresses').value.trim().split('\n').filter(Boolean);

        if (!apiKey) {
            document.getElementById('popup').style.display = 'block';
            return;
        }

        const results = [];
        for (const address of addresses) {
            try {
                const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 'my-id',
                        method: 'searchAssets',
                        params: {
                            ownerAddress: address.trim(),
                            tokenType: 'fungible',
                            displayOptions: {
                                showNativeBalance: true,
                            },
                        },
                    }),
                });

                const { result } = await response.json();
                const balance = result?.nativeBalance?.lamports || 0;
                const price = result?.nativeBalance?.total_price || 0;

                results.push({
                    address: address.trim(),
                    balance: balance / 1e9, // Переводим лампорты в SOL
                    price: price,
                });
            } catch (error) {
                console.error(`Error fetching data for address ${address}:`, error);
                results.push({
                    address: address.trim(),
                    balance: 0,
                    price: 0,
                });
            }
        }

        updateResults(results);
    });

    // Закрытие всплывающего окна с ошибкой
    document.getElementById('close-popup').addEventListener('click', () => {
        document.getElementById('popup').style.display = 'none';
    });

    // Открытие всплывающего окна с инструкцией по получению API ключа
    document.getElementById('how-to-get-key').addEventListener('click', () => {
        document.getElementById('how-to-get-key-popup').style.display = 'block';
    });

    // Закрытие всплывающего окна с инструкцией по получению API ключа
    document.getElementById('close-how-to-get-key').addEventListener('click', () => {
        document.getElementById('how-to-get-key-popup').style.display = 'none';
    });
});

// Обновление результатов
const updateResults = (results) => {
    const resultsTableBody = document.querySelector('#results-table tbody');
    resultsTableBody.innerHTML = ''; // Очистить предыдущие результаты

    let totalBalance = 0;
    let totalPrice = 0;

    results.forEach(result => {
        const row = document.createElement('tr');

        const addressCell = document.createElement('td');
        addressCell.textContent = result.address;
        row.appendChild(addressCell);

        const balanceCell = document.createElement('td');
        // Проверяем, если баланс существует и является числом
        const balance = result.balance !== undefined ? parseFloat(result.balance) : 0;
        balanceCell.textContent = `${isNaN(balance) ? '0.0000' : balance.toFixed(4)} SOL`; // Форматируем баланс
        row.appendChild(balanceCell);

        resultsTableBody.appendChild(row);

        // Суммируем балансы
        totalBalance += isNaN(balance) ? 0 : balance;
        totalPrice += isNaN(result.price) ? 0 : result.price;
    });

    // Обновляем итоговые значения
    const summary = document.querySelector('#summary');
    summary.innerHTML = `
        <p>Total Balance: ${totalBalance.toFixed(4)} SOL</p>
        <p>Total Price: ${totalPrice.toFixed(2)} USD</p>
    `;
};