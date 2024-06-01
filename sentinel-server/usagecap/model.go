package usagecap

import "github.com/google/uuid"

const (
	UsageCapApplicationTable = "usage_cap_application"
	UsageCapVersionTable     = "usage_cap_version"
	UsageCapBlockTable       = "usage_cap_block"

	UsageCapApplicationFreeTier = 3
	UsageCapVersionFreeTier     = 3
	UsageCapBlockFreeTier       = 10

	UsageCapApplicationProTier = 1000
	UsageCapVersionProTier     = 3
	UsageCapBlockProTier       = 20

	UsageCapApplicationEnterpriseTier = 10000
	UsageCapVersionEnterpriseTier     = 100
	UsageCapBlockEnterpriseTier       = 1000
)

type UsageCapApplication struct {
	UserID    uuid.UUID `json:"user_id"`
	Remaining int       `json:"remaining"`
}

type UsageCapVersion struct {
	UserID        uuid.UUID `json:"user_id"`
	ApplicationID uuid.UUID `json:"application_id"`
	Remaining     int       `json:"remaining"`
}

type UsageCapBlock struct {
	UserID        uuid.UUID `json:"user_id"`
	ApplicationID uuid.UUID `json:"application_id"`
	Version       string    `json:"version"`
	Remaining     int       `json:"remaining"`
}
