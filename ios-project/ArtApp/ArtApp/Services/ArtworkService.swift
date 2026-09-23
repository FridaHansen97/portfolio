import Foundation

struct ArtworkService {
    private let baseURL = "https://api.artic.edu/api/v1/artworks/search"
    private let fields = "id,title,artist_display,date_display,image_id,thumbnail"

    func searchArtworks(query: String, page: Int = 1) async throws -> ArtworkResponse {
        guard var components = URLComponents(string: baseURL) else {
            throw URLError(.badURL)
        }

        var queryItems = [
            URLQueryItem(name: "fields", value: fields),
            URLQueryItem(name: "limit", value: "20"),
            URLQueryItem(name: "page", value: String(page))
        ]
        if !query.isEmpty {
            queryItems.append(URLQueryItem(name: "q", value: query))
        }
        components.queryItems = queryItems

        guard let url = components.url else {
            throw URLError(.badURL)
        }

        var request = URLRequest(url: url)
        request.setValue("ArtApp (github.com/yourname)", forHTTPHeaderField: "AIC-User-Agent")

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200..<300).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode(ArtworkResponse.self, from: data)
    }
}
