# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["NakaeWorks.Backend.csproj", "NakaeWorks.Backend/"]
WORKDIR "/src/NakaeWorks.Backend"
RUN dotnet restore "NakaeWorks.Backend.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "NakaeWorks.Backend.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "NakaeWorks.Backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Run Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "NakaeWorks.Backend.dll"]
