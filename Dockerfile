# ---- Build aşaması ----
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY API/API.csproj API/
RUN dotnet restore API/API.csproj

COPY API/ API/
RUN dotnet publish API/API.csproj -c Release -o /app/publish

# ---- Çalıştırma aşaması ----
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 10000
ENV ASPNETCORE_URLS=http://+:10000

ENTRYPOINT ["dotnet", "API.dll"]
