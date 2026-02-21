FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["NakaeWorks.Backend/NakaeWorks.Backend.csproj", "NakaeWorks.Backend/"]
RUN dotnet restore "NakaeWorks.Backend/NakaeWorks.Backend.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/NakaeWorks.Backend"
RUN dotnet build "NakaeWorks.Backend.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "NakaeWorks.Backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Build the final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Ensure wwwroot exists so the app doesn't complain
RUN mkdir -p wwwroot/uploads

# Expose port (Coolify defaults to 8080, .NET 8 default is also 8080)
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

ENTRYPOINT ["dotnet", "NakaeWorks.Backend.dll"]
