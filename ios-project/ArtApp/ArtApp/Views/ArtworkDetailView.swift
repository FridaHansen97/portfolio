import SwiftUI
import SwiftData

struct ArtworkDetailView: View {
    let artwork: Artwork
    
    @Environment(\.modelContext) private var modelContext
    @Query private var favorites: [FavoriteArtwork]
    
    private var favorite: FavoriteArtwork? {
        favorites.first { $0.artworkId == artwork.id }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                AsyncImage(url: artwork.imageURL) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFit()
                    case .failure:
                        Image(systemName: "photo")
                            .frame(maxWidth: .infinity, minHeight: 200)
                    default:
                        ProgressView()
                            .frame(maxWidth: .infinity, minHeight: 200)
                    }
                }
                .accessibilityLabel(artwork.title ?? "Artwork")

                VStack(alignment: .leading, spacing: 4) {
                    Text(artwork.title ?? "Untitled")
                        .font(.title2)
                        .fontWeight(.bold)

                    Text(artwork.creators?.first?.description ?? "Unknown artist")
                        .foregroundStyle(.secondary)

                    if let date = artwork.creationDate {
                        Text(date)
                            .foregroundStyle(.secondary)
                    }
                }

                if let technique = artwork.technique {
                    Text(technique)
                        .font(.subheadline)
                        .italic()
                }

                if let description = artwork.description {
                    Text(description)
                }
            }
            .padding()
        }
        .navigationTitle(artwork.title ?? "Artwork")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    toggleFavorite()
                }label: {
                    Image(systemName: favorite != nil ? "heart.fill" : "heart")
                }
                .accessibilityLabel(favorite != nil ? "Remove from favorites" : "Add to favorites")
            }
        }
    }
    
    private func toggleFavorite() {
        if let favorite {
            modelContext.delete(favorite)
        } else {
            modelContext.insert(FavoriteArtwork(artwork: artwork))
        }
    }
}



#Preview {
    NavigationStack {
        ArtworkDetailView(artwork: .sample)
    }
    .modelContainer(for: FavoriteArtwork.self, inMemory: true)
}
