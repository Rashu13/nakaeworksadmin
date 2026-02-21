# 1. Build React Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY adminPanal/package*.json ./
RUN npm install
COPY adminPanal/ ./
# We can pass an ARG for API if needed, or by default it'll use the relative path mapped to the .NET backend
RUN npm run build

# 2. Build .NET Backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src
COPY backend_net/NakaeWorks.Backend/NakaeWorks.Backend.csproj backend_net/NakaeWorks.Backend/
RUN dotnet restore backend_net/NakaeWorks.Backend/NakaeWorks.Backend.csproj
COPY backend_net/NakaeWorks.Backend/ backend_net/NakaeWorks.Backend/
WORKDIR /src/backend_net/NakaeWorks.Backend
RUN dotnet publish -c Release -o /app/publish

# 3. Final Image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Ensure wwwroot and uploads exist
RUN mkdir -p /app/wwwroot/uploads

# Copy backend binaries
COPY --from=backend-build /app/publish .

# Copy frontend build into wwwroot so ASP.NET can serve it
COPY --from=frontend-build /app/dist ./wwwroot

# Expose port that Coolify will detect
EXPOSE 8080

ENV ASPNETCORE_HTTP_PORTS=8080
ENV ASPNETCORE_URLS=http://+:8080
ENV DEFAULT_PORT=8080
ENV PORT=8080

# Environment variables for the backend (Set these in Coolify's Environment Variables tab)
# ENV ConnectionStrings__DefaultConnection="Your Connection String"
# ENV Jwt__Key="Your Super Secret Key"

ENTRYPOINT ["dotnet", "NakaeWorks.Backend.dll"]
