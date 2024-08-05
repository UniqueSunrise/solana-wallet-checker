document.getElementById('check-balances').addEventListener('click', async () => {
    const apiKey = document.getElementById('api-key').value.trim();
    const addresses = document.getElementById('wallet-addresses').value.split('\n').slice(0, 100);
    const resultsTableBody = document.querySelector('#results-table tbody');
    const summaryDiv = document.getElementById('summary');

    if (!apiKey) {
        showPopup();
        return;
    }

    resultsTableBody.innerHTML = '';
    summaryDiv.innerHTML = ''; 

    let totalBalance = 0;
    let totalPrice = 0;

    for (let address of addresses) {
        address = address.trim();
        if (address) {
            try {
                const result = await getAssetsWithNativeBalance(apiKey, address);
                let lamports = (result.lamports / 1e9).toFixed(5);
                lamports = isNaN(lamports) ? 0 : lamports; // Если NaN, то записываем как 0
                totalBalance += parseFloat(lamports);
                totalPrice += result.total_price;
                const row = `<tr>
                                <td><address>${address}</address></td>
                                <td>${lamports} SOL</td>
                             </tr>`;
                resultsTableBody.innerHTML += row;
            } catch (error) {
                const row = `<tr>
                                <td colspan="2">Error fetching data for address: ${address}</td>
                             </tr>`;
                resultsTableBody.innerHTML += row;
            }
            await sleep(1500); // Задержка в 2 секунды между запросами
        }
    }

    summaryDiv.innerHTML = `<p>Total Balance: ${totalBalance.toFixed(5)} SOL</p><p>Total Price: $${totalPrice.toFixed(5)}</p>`;
});

const getAssetsWithNativeBalance = async (apiKey, address) => {
    const url = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'my-id',
            method: 'searchAssets',
            params: {
                ownerAddress: address,
                tokenType: 'fungible',
                displayOptions: {
                    showNativeBalance: true,
                },
            },
        }),
    });

    const { result } = await response.json();
    if (response.ok) {
        return result.nativeBalance;
    } else {
        throw new Error(result.error.message);
    }
};

// Функция для создания задержки
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const showPopup = () => {
    const popup = document.getElementById('popup');
    popup.style.display = 'block';
};

const closePopup = () => {
    const popup = document.getElementById('popup');
    popup.style.display = 'none';
};

document.getElementById('close-popup').addEventListener('click', closePopup);
window.addEventListener('click', (event) => {
    const popup = document.getElementById('popup');
    if (event.target == popup) {
        popup.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const apiKeyLink = document.getElementById('how-to-get-key');
    const howToGetKeyPopup = document.getElementById('how-to-get-key-popup');
    const closeHowToGetKeyBtn = document.getElementById('close-how-to-get-key');
    const mainPopup = document.getElementById('popup');
    const closePopupBtn = document.getElementById('close-popup');

    apiKeyLink.addEventListener('click', (event) => {
        event.preventDefault();
        howToGetKeyPopup.style.display = 'block';
    });

    closeHowToGetKeyBtn.addEventListener('click', () => {
        howToGetKeyPopup.style.display = 'none';
    });

    closePopupBtn.addEventListener('click', () => {
        mainPopup.style.display = 'none';
    });

    // Function to show the main popup
    function showMainPopup() {
        mainPopup.style.display = 'block';
    }
});
