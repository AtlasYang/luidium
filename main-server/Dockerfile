FROM rust:bookworm as builder

WORKDIR /app

COPY . .

RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt install -y openssl

COPY --from=builder /app/target/release/main-server /app/main-server

WORKDIR /app

EXPOSE 10002

CMD ["./main-server"]