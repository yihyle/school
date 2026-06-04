# EC2 배포 가이드 (Docker Compose)

대상 인스턴스: `13.125.156.72` (Amazon Linux, user: `ec2-user`)

## 1. AWS 보안그룹 인바운드 규칙

AWS 콘솔 → EC2 → 인스턴스 → 보안 → 보안그룹 → 인바운드 규칙 편집:

| 유형 | 포트 | 소스 | 용도 |
|---|---|---|---|
| SSH | 22 | 내 IP | 접속용 |
| HTTP | 80 | 0.0.0.0/0 | 프론트 |
| 사용자 지정 TCP | 8080 | 0.0.0.0/0 | 백엔드 API |

> 3306(MySQL)은 컨테이너 네트워크 내부에서만 쓰니까 열지 마세요.

## 2. EC2 접속 후 도구 설치

```bash
ssh ec2-user@13.125.156.72

# Docker 설치
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
exit   # 그룹 적용을 위해 재접속
ssh ec2-user@13.125.156.72

# Docker Compose v2 플러그인
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
docker compose version
```

## 3. 코드 업로드

**옵션 A: GitHub 사용 (권장)**

```bash
cd ~
git clone <리포지토리-URL> ug2026
cd ug2026
```

**옵션 B: 로컬에서 rsync 업로드 (리포 없을 때)**

로컬 맥에서:
```bash
cd /Users/ihyeonseog/Desktop/vscode/ug2026
rsync -avz --exclude node_modules --exclude .next --exclude build \
  --exclude .gradle --exclude .git \
  ./ ec2-user@13.125.156.72:~/ug2026/
```

## 4. 환경변수 파일 작성

EC2에서:
```bash
cd ~/ug2026
cp .env.prod.example .env.prod
nano .env.prod
```

값 채우기:
- `MYSQL_ROOT_PASSWORD`: 강력한 비밀번호
- `JWT_SECRET`: 32자 이상 랜덤 문자열 (`openssl rand -base64 48` 활용)
- 나머지는 IP가 같으면 그대로 두면 됨

## 5. 빌드 + 실행

```bash
cd ~/ug2026
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

빌드는 처음에 5~10분 걸려요 (Gradle + Next.js).

## 6. 상태 확인

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
```

브라우저에서:
- 프론트: http://13.125.156.72
- 백엔드: http://13.125.156.72:8080/swagger-ui.html

## 7. 재배포 (코드 변경 후)

```bash
cd ~/ug2026
git pull   # 또는 rsync 다시
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

## 8. 트러블슈팅

**프론트에서 백엔드 호출이 CORS 에러**
→ `.env.prod`의 `CORS_ALLOWED_ORIGINS`가 브라우저 주소창의 origin과 정확히 일치해야 함 (http/https, 포트 포함).

**`docker compose` 명령 없음**
→ 2단계 Compose 플러그인 설치 다시 확인.

**메모리 부족으로 빌드 실패**
→ t2.micro 같은 1GB RAM 인스턴스면 스왑 추가:
```bash
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
```

**Flyway 마이그레이션 충돌**
→ DB 초기화: `docker compose -f docker-compose.prod.yml down -v` 후 다시 up (데이터 날아감 주의).
