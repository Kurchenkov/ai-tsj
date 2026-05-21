FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY HouseHub.sln ./
COPY src/HouseHub.Api/*.csproj src/HouseHub.Api/
COPY src/HouseHub.Application/*.csproj src/HouseHub.Application/
COPY src/HouseHub.Domain/*.csproj src/HouseHub.Domain/
COPY src/HouseHub.Infrastructure/*.csproj src/HouseHub.Infrastructure/
COPY tests/HouseHub.UnitTests/*.csproj tests/HouseHub.UnitTests/
COPY tests/HouseHub.IntegrationTests/*.csproj tests/HouseHub.IntegrationTests/
RUN dotnet restore src/HouseHub.Api/HouseHub.Api.csproj

COPY . .
RUN dotnet publish src/HouseHub.Api/HouseHub.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "HouseHub.Api.dll"]
