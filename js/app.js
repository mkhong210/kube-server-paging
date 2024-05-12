// app.js
// 총 9개의 데이터 페이징 구현하기 
// 페이지 별로 3개씩 나오게 하기 

// 데이터 저장 
let allData = [];

let page = 1;

const limit = 3;
let continueToken = null;
let continueTokens = []; // continueToken 스택 

// 이전 버튼
function previousPage() {
	page--;
	fetchData('prev');
}

// 다음 버튼 
function nextPage() {
	page++;
	fetchData('next');
}


// 페이지 초기화 및 데이터 호출
fetchData();

// 데이터 호출 함수
async function fetchData(direction) {
	const prevBtn = document.getElementById('prevBtn');
	const nextBtn = document.getElementById('nextBtn');
	const apiUrl = 'http://127.0.0.1:5001/k8s/api/v1/pods';
	const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Im9GQVR6alV5QlZHamMtNTZqNkdWM2VVZkJwc2xCYU12VmlqcEJqbnZkOUUifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLWx0NHd2Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiI5ZmM1Nzk2NS05YzU1LTQ4YjQtOGZhOC0wZjRiMzU3ZGUwZDciLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06YWRtaW4tdXNlciJ9.aJGF-FlP5ZB_4KSVx-pC-UkKsznGqmmm7WtbL4NRFoT5VnTvaz_PT_u7AAG4dAp4EFbejPxpdixK1wVaJs5pAg5RIDHyrcU9AZgfpVIxPpvwiHf8-keociroPJSy4Mue80Z4N5u-wf5PjyzxYwxxy9tzb0lPBysDdAIfh1L-2jBQdatmTczzix4kc_e3oanobXGWPLVAhyI8J7mI7oBg_iEMbwVsMrG2FDuZGmqOg67W-npsi8Br1HIaIQ2uOKtzSGwVdN6q9yksbSLvocQm-J6CxNh9FKq_AtFTSBLW-60CoZSnpKUuKq4Za5tocE4tPjNCPHJesJIb_5_7IVQ5lQ'; // Be very cautious with token security

	let url = `${apiUrl}?limit=${limit}`;

	// console.log('page:',page,' / continueToken:',continueToken);
	
	// check continue token array
	if (continueToken) {
		if (direction === 'prev') {
			if (continueTokens.length > 0) {
				continueToken = continueTokens[continueTokens.length - 1];
				continueTokens.pop();
			}
		} else if (direction === 'next') {
			continueTokens.push(continueToken);
		}
	}
	
	/**
	 * continue 값을 넣어야 할 때
	 * 1. 다음페이지로 이동 (continueToken 이 undefined 가 아닐 때)
	 * 2. 이전페이지로 이동 (1page 이동 제외)
	 * continue token 값을 어디껄 가져와야 하는가
	 * - 다음 페이지 이동 시에는 continueToken 값 바로 활용
	 * - 이전 페이지 이동 시에는 배열 내에 [page - 2] 번째 token 활용
	 */
	// check prev/next button
	if (direction === 'prev') {
		if (page > 1) url += `&continue=${continueTokens[page - 2]}`;
	} else if (direction === 'next') {
		if (continueToken) url += `&continue=${continueToken}`;
	}

	// console.log('continueTokens:',continueTokens)
	// console.log('direction:',direction,' / url:',url)

	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		// document.getElementById('output2').textContent = JSON.stringify(data, null, 2);
		// displayData(data.items); // 데이터 함수

		allData = data.items;
		continueToken = data.metadata.continue;
		// console.log('allData:',allData, data.metadata.continue)
		
		if (page === 1) {
			prevBtn.disabled = true;
			prevBtn.classList.add('cursor-not-allowed');
		} else {
			prevBtn.disabled = false;
			prevBtn.classList.remove('cursor-not-allowed');
		}
		if (continueToken === undefined) {
			nextBtn.disabled = true;
			nextBtn.classList.add('cursor-not-allowed');
		} else {
			nextBtn.disabled = false;
			nextBtn.classList.remove('cursor-not-allowed');
		}

		displayData(allData)

		// console.log(url)
	
	} catch (error) {
		console.error('Fetch error:', error);
		document.getElementById('output2').textContent = 'Error fetching data';
	}
}


// 데이터 테이블에 출력
function displayData(deployments) {
	// console.log(deployments);
	const tableBodies = document.getElementsByTagName('tbody');

	for (let i = 0; i < tableBodies.length; i++) {
		const tableBody = tableBodies[i];
		tableBody.innerHTML = '';

		deployments.forEach(deployment => {
			const row = document.createElement('tr');

			// Name
			const nameCell = document.createElement('td');
			nameCell.textContent = deployment.metadata.name;
			row.appendChild(nameCell);

			// Labels
			const labelsCell = document.createElement('td');
			const labels = deployment.metadata.labels;
			const labelsText = labels ? Object.keys(labels).map(key => `${key}: ${labels[key]}`).join(', ') : '';
			labelsCell.textContent = labelsText;
			row.appendChild(labelsCell);

			// // Namespace
			// const namespaceCell = document.createElement('td');
			// namespaceCell.textContent = deployment.metadata.namespace;
			// row.appendChild(namespaceCell);

			// Ready
			const readyCell = document.createElement('td');
			readyCell.className = "text-center"
			readyCell.textContent = deployment.status.conditions[1].status;
			row.appendChild(readyCell);

			// Up-to-date
			const phaseCell = document.createElement('td');
			phaseCell.className = "text-center"
			phaseCell.textContent = deployment.status.conditions[1].status;
			row.appendChild(phaseCell);

			// available = Phase
			const availableCell = document.createElement('td');
			availableCell.className = "text-center"
			availableCell.textContent = deployment.status.phase;
			row.appendChild(availableCell);

			tableBody.appendChild(row);
		});
	}
}