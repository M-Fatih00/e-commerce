FROM node:22-slim AS client
WORKDIR /client
COPY Client/package.json Client/package-lock.json ./
RUN npm ci
COPY Client/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY API/API.csproj API/
RUN dotnet restore API/API.csproj
COPY API/ API/
COPY --from=client /client/dist/ API/wwwroot/
RUN dotnet publish API/API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 10000
ENV ASPNETCORE_URLS=http://+:10000

ENTRYPOINT ["dotnet", "API.dll"]