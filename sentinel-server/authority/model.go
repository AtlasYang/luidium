package authority

import "github.com/google/uuid"

const (
	AuthorityClassAdmin        = "admin"
	AuthorityClassOwner        = "owner"
	AuthorityClassCollaborator = "collaborator"
	AuthorityClassViewer       = "viewer"
)

type Authority struct {
	UserID   uuid.UUID `json:"user_id"`
	EntityID uuid.UUID `json:"entity_id"`
	Class    string    `json:"class"`
}
