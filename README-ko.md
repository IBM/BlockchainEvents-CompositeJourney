# Hyperledger Composer - Product Auction Network With Events

*다른 언어로 보기: [English](README.md)*

하이퍼레저 컴포저(Hyperledger Composer) Composite Journey의 Part 3에 오신 것을 환영합니다. 이 과정은 [하이퍼레저 컴포저 - 상품 경매 네트워크](https://github.com/IBM/BlockchainSmartContractTrading-CompositeJourney/blob/master/README-ko.md) 시리즈 중 하나입니다. 이 과정에서는 하이퍼레저 컴포저에서 이벤트를 내보내고, 외부 애플리케이션에서 구독하는 방법을 다루게 됩니다.

## 구성 요소

* 하이퍼레저 패브릭 (Hyperledger Fabric)
* 하이퍼레저 컴포저 (Hyperledger Composer)
* 도커 (Docker)

## 애플리케이션 워크플로우 도표

![Workflow](images/workflow.png)

* 하이퍼레저 패브릭 네트워크 시작
* BNA (Business Network Archive) 생성 및 배포
* 컴포저 레스트 서버를 시작하여 배포된 비즈니스 네트워크에 연결
* 웹 애플리케이션 시작

## 단계

1. [비즈니스 네트워크 아카이브 (BNA) 생성](#1-비즈니스-네트워크-아카이브-bna-생성)
2. [로컬에서 실행되는 하이퍼레저 컴포저에 비즈니스 네트워크 아카이브 배포](#2-로컬에서-실행되는-하이퍼레저-컴포저에-비즈니스-네트워크-아카이브-배포)
3. [웹 UI 시작하기](#3-웹-ui-시작하기)
4. [트랜잭션 수행하기](#4-트랜잭션-수행하기)

## 1. 비즈니스 네트워크 아카이브 (BNA) 생성

[하이퍼레저 컴포저 개발 툴](https://github.com/IBM/BlockchainNetwork-CompositeJourney/blob/master/README-ko.md#1-%ED%95%98%EC%9D%B4%ED%8D%BC%EB%A0%88%EC%A0%80-%EC%BB%B4%ED%8F%AC%EC%A0%80-%EA%B0%9C%EB%B0%9C-%ED%88%B4-%EC%84%A4%EC%B9%98%ED%95%98%EA%B8%B0)을 설치합니다.

저장소를 복제하십시오:
```
git clone https://github.com/IBM/BlockchainEvents-CompositeJourney.git
```

파일 구조가 유효한지 확인하려면 비즈니스 네트워크 정의에 대한 BNA (Business Network Archive) 파일을 생성합니다. BNA 파일은 배포 가능한 유닛으로 실행을 위해 컴포저 런타임에 배포할 수 있습니다.

다음 명령을 사용하여 네트워크 아카이브를 생성합니다:
```bash
cd Composer
npm install
```
아래와 같은 결과가 나옵니다:
```bash
> mkdirp ./dist && composer archive create --sourceType dir --sourceName . -a ./dist/events.bna

Creating Business Network Archive


Looking for package.json of Business Network Definition
	Input directory: /Users/ishan/Documents/demo/BlockchainEvents-CompositeJourney/Composer

Found:
	Description: Sample product auction network with events
	Name: events
	Identifier: events@0.0.1

Written Business Network Definition Archive file to
	Output file: ./dist/events.bna

Command succeeded
```

`composer archive create` 명령을 사용하여 `dist` 폴더에 `events.bna`라는 파일을 생성했습니다.

Node.js 프로세스에서 '블록체인' 인메모리 상태를 저장하는 임베디드 런타임에 대해 비즈니스 네트워크 정의를 테스트할 수 있습니다.
프로젝트 작업 디렉토리에서 test/productAuction.js 파일을 열고 다음의 명령을 실행하십시오:
```
npm test
```
아래와 같은 결과가 보입니다 :
```
> events@0.0.1 test /Users/ishan/Documents/demo/BlockchainEvents-CompositeJourney/Composer
> mocha --recursive

  ProductAuction - AddProduct Test
    #BiddingProcess
      ✓ Add the product to seller list (154ms)
      ✓ Authorized owner should start the bidding (117ms)
      ✓ Members bid for the product (181ms)
      ✓ Close bid for the product (96ms)


  4 passing (2s)
```

## 2. 로컬에서 실행되는 하이퍼레저 컴포저에 비즈니스 네트워크 아카이브 배포

[가이드](https://github.com/IBM/BlockchainNetwork-CompositeJourney/blob/master/README-ko.md#2-%ED%95%98%EC%9D%B4%ED%8D%BC%EB%A0%88%EC%A0%80-%ED%8C%A8%EB%B8%8C%EB%A6%AD-%EC%8B%9C%EC%9E%91%ED%95%98%EA%B8%B0)를 참고하여 로컬 패브릭을 시작합니다.
이제 `product-auction.bna` 파일이 들어있는 `dist` 폴더로 디렉토리를 변경하고 다음을 입력합니다:
```
cd dist
composer runtime install --card PeerAdmin@hlfv1 --businessNetworkName events
composer network start --card PeerAdmin@hlfv1 --networkAdmin admin --networkAdminEnrollSecret adminpw --archiveFile events.bna --file networkadmin.card
composer card import --file networkadmin.card
```

다음을 입력하여 네트워크가 배포되었는지 확인할 수 있습니다:
```
composer network ping --card admin@events
```

아래와 같은 결과가 보여집니다:
```
The connection to the network was successfully tested: events
	version: 0.16.0
	participant: org.hyperledger.composer.system.NetworkAdmin#admin

Command succeeded
```

REST API를 만들려면 `composer-rest-server` 를 시작하여 배포된 비즈니스 네트워크의 접속 정보를 설정합니다.  and tell it how to connect to our deployed business network.
이제 디렉토리를 제품 경매 폴더로 변경하고 다음을 입력하여 서버를 시작하십시오:
```bash
cd ..
composer-rest-server
```

시작할 때 나타난 질문들에 답하십시오. 이를 통해 composer-rest-server는 하이퍼레저 패브릭에 연결하고 REST API 생성 방법을 구성할 수 있습니다.
* 카드 이름으로 `admin@events`를 입력하십시오.
* 생성된 API에서 네임스페이스 사용 여부를 묻는다면 `never use namespaces`를 선택합니다.
* 생성된 API의 보안 여부를 묻는다면 `No`를 선택합니다.
* 이벤트 게시를 활성화할지 묻는다면 `Yes`를 선택합니다.
* TLS 보안의 사용 여부를 묻는다면 `No`를 선택합니다.

**REST API 테스트**

composer-rest-server가 성공적으로 시작된 경우, 다음 두 줄이 출력되어야 합니다:
```
Web server listening at: http://localhost:3000
Browse your REST API at http://localhost:3000/explorer
```

## 3. 웹 UI 시작하기

새 터미널 창에서 `Web` 디렉토리로 이동하고 다음 명령을 사용하여 노드 서버를 시작합니다:
```
npm install
node server.js
```

## 4. 트랜잭션 수행하기

[컴포저 섹션](https://github.com/IBM/BlockchainSmartContractTrading-CompositeJourney/blob/master/README-ko.md#2-%EC%BB%B4%ED%8F%AC%EC%A0%80-%ED%94%8C%EB%A0%88%EC%9D%B4%EA%B7%B8%EB%9D%BC%EC%9A%B4%EB%93%9C%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%98%EC%97%AC-%EB%B9%84%EC%A6%88%EB%8B%88%EC%8A%A4-%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC-%EC%95%84%EC%B9%B4%EC%9D%B4%EB%B8%8C-%EB%B0%B0%ED%8F%AC%ED%95%98%EA%B8%B0)에 나와있는 지침에 따라 경매 네트워크에서 트랜잭션을 수행하십시오. 사용자가 `publishListing`, `makeoffer` 그리고 `closeBidding` 트랜잭션을 수행할 때에 이벤트가 발생됩니다. 하이퍼레저 패브릭 네트워크에서 발생된 이벤트로 인해 판매자 및 구매자를 위한 Web UI가 업데이트됩니다.

로컬에서 실행되는 Composer REST API 또는 Composer Playground를 사용하여 트랜잭션을 제출할 수 있습니다.

### Composer REST API를 사용하여 트랜잭션 제출하기

웹브라우저를 열어 http://localhost:3000/explorer 로 이동하십시오.

### 로컬에서 실행되는 Composer Playground 사용하기

새 터미널을 열고 `BlockchainEvents` 디렉토리로 이동합니다. 다음 명령을 사용하여 Composer Playground를 설치합니다:
```
npm i composer-playground@0.16.1
```

로컬에서 composer playground를 사용하시려면 다음을 사용하십시오:
```
composer-playground
```

판매자 및 구매자 이벤트에 대한 대시보드를 보려면 http://localhost:8000/seller.html, http://localhost:8000/buyer.html 로 이동하십시오.

## 추가 리소스
* [Hyperledger Fabric Docs](http://hyperledger-fabric.readthedocs.io/en/latest/)
* [Hyperledger Composer Docs](https://hyperledger.github.io/composer/introduction/introduction.html)

## 라이센스
[Apache 2.0](LICENSE)
