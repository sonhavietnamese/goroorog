/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/goroorog.json`.
 */
export type Goroorog = {
  address: '7FyBUa4ZCA2krXYmSkJW6jdfZGVUpF6wTbYNUE5jRFyq'
  metadata: {
    name: 'goroorog'
    version: '0.1.0'
    spec: '0.1.0'
    description: 'Created with Anchor'
  }
  instructions: [
    {
      name: 'createBoss'
      discriminator: [236, 146, 175, 37, 15, 250, 2, 52]
      accounts: [
        {
          name: 'payer'
          writable: true
          signer: true
        },
        {
          name: 'boss'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [98, 111, 115, 115]
              },
              {
                kind: 'arg'
                path: 'id'
              },
            ]
          }
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'id'
          type: 'u8'
        },
      ]
    },
    {
      name: 'createHistory'
      discriminator: [17, 80, 83, 78, 168, 45, 161, 35]
      accounts: [
        {
          name: 'payer'
          writable: true
          signer: true
        },
        {
          name: 'from'
          writable: true
        },
        {
          name: 'to'
          writable: true
        },
        {
          name: 'history'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [104, 105, 115, 116, 111, 114, 121]
              },
              {
                kind: 'account'
                path: 'from'
              },
              {
                kind: 'account'
                path: 'to'
              },
            ]
          }
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'value'
          type: 'u64'
        },
      ]
    },
    {
      name: 'createPlayer'
      discriminator: [19, 178, 189, 216, 159, 134, 0, 192]
      accounts: [
        {
          name: 'payer'
          writable: true
          signer: true
        },
        {
          name: 'owner'
          writable: true
        },
        {
          name: 'player'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [112, 108, 97, 121, 101, 114, 115]
              },
              {
                kind: 'account'
                path: 'owner'
              },
              {
                kind: 'account'
                path: 'payer'
              },
            ]
          }
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: []
    },
    {
      name: 'createResource'
      discriminator: [42, 4, 153, 170, 163, 159, 188, 194]
      accounts: [
        {
          name: 'payer'
          writable: true
          signer: true
        },
        {
          name: 'owner'
          writable: true
        },
        {
          name: 'resource'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [114, 101, 115, 111, 117, 114, 99, 101, 115]
              },
              {
                kind: 'arg'
                path: 'id'
              },
              {
                kind: 'account'
                path: 'owner'
              },
              {
                kind: 'account'
                path: 'payer'
              },
            ]
          }
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'id'
          type: 'u8'
        },
        {
          name: 'data'
          type: {
            array: ['u64', 1]
          }
        },
      ]
    },
    {
      name: 'createSkill'
      discriminator: [240, 192, 94, 78, 47, 203, 128, 183]
      accounts: [
        {
          name: 'payer'
          writable: true
          signer: true
        },
        {
          name: 'owner'
          writable: true
        },
        {
          name: 'skill'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [115, 107, 105, 108, 108, 115]
              },
              {
                kind: 'arg'
                path: 'id'
              },
              {
                kind: 'account'
                path: 'owner'
              },
              {
                kind: 'account'
                path: 'payer'
              },
            ]
          }
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'id'
          type: 'u8'
        },
        {
          name: 'data'
          type: {
            array: ['u64', 2]
          }
        },
      ]
    },
    {
      name: 'createStat'
      discriminator: [137, 27, 122, 198, 137, 103, 149, 34]
      accounts: [
        {
          name: 'payer'
          writable: true
          signer: true
        },
        {
          name: 'owner'
          writable: true
        },
        {
          name: 'stat'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [115, 116, 97, 116, 115]
              },
              {
                kind: 'arg'
                path: 'id'
              },
              {
                kind: 'account'
                path: 'owner'
              },
              {
                kind: 'account'
                path: 'payer'
              },
            ]
          }
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'id'
          type: 'u8'
        },
        {
          name: 'data'
          type: {
            array: ['u64', 2]
          }
        },
      ]
    },
    {
      name: 'updateHistory'
      discriminator: [184, 72, 181, 37, 174, 69, 222, 219]
      accounts: [
        {
          name: 'payer'
          writable: true
          signer: true
        },
        {
          name: 'owner'
          writable: true
        },
        {
          name: 'history'
          writable: true
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'data'
          type: {
            array: ['u64', 1]
          }
        },
      ]
    },
    {
      name: 'updateResource'
      discriminator: [240, 208, 156, 86, 230, 216, 1, 100]
      accounts: [
        {
          name: 'payer'
          writable: true
          signer: true
        },
        {
          name: 'owner'
          writable: true
        },
        {
          name: 'resource'
          writable: true
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'data'
          type: {
            array: ['u64', 1]
          }
        },
      ]
    },
    {
      name: 'updateStat'
      discriminator: [126, 16, 71, 120, 116, 61, 207, 40]
      accounts: [
        {
          name: 'payer'
          writable: true
          signer: true
        },
        {
          name: 'owner'
          writable: true
        },
        {
          name: 'stat'
          writable: true
        },
        {
          name: 'resource'
          writable: true
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'data'
          type: {
            array: ['u64', 2]
          }
        },
      ]
    },
  ]
  accounts: [
    {
      name: 'bosses'
      discriminator: [19, 12, 238, 180, 128, 46, 156, 232]
    },
    {
      name: 'history'
      discriminator: [31, 216, 60, 33, 213, 209, 70, 101]
    },
    {
      name: 'players'
      discriminator: [18, 110, 204, 126, 36, 130, 148, 10]
    },
    {
      name: 'resources'
      discriminator: [252, 239, 111, 79, 54, 7, 67, 233]
    },
    {
      name: 'skills'
      discriminator: [12, 66, 43, 173, 249, 66, 125, 107]
    },
    {
      name: 'stats'
      discriminator: [190, 125, 51, 63, 169, 197, 36, 238]
    },
  ]
  errors: [
    {
      code: 6000
      name: 'notOwner'
      msg: 'Not owner'
    },
  ]
  types: [
    {
      name: 'bosses'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'bossId'
            type: 'u8'
          },
          {
            name: 'level'
            type: 'u64'
          },
          {
            name: 'bump'
            type: 'u8'
          },
        ]
      }
    },
    {
      name: 'history'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'authority'
            type: 'pubkey'
          },
          {
            name: 'from'
            type: 'pubkey'
          },
          {
            name: 'to'
            type: 'pubkey'
          },
          {
            name: 'value'
            type: 'u64'
          },
          {
            name: 'bump'
            type: 'u8'
          },
        ]
      }
    },
    {
      name: 'players'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'authority'
            type: 'pubkey'
          },
          {
            name: 'bump'
            type: 'u8'
          },
        ]
      }
    },
    {
      name: 'resources'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'authority'
            type: 'pubkey'
          },
          {
            name: 'resourceId'
            type: 'u8'
          },
          {
            name: 'amount'
            type: 'u64'
          },
          {
            name: 'bump'
            type: 'u8'
          },
        ]
      }
    },
    {
      name: 'skills'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'authority'
            type: 'pubkey'
          },
          {
            name: 'skillId'
            type: 'u8'
          },
          {
            name: 'base'
            type: 'u64'
          },
          {
            name: 'level'
            type: 'u64'
          },
          {
            name: 'bump'
            type: 'u8'
          },
        ]
      }
    },
    {
      name: 'stats'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'authority'
            type: 'pubkey'
          },
          {
            name: 'statId'
            type: 'u8'
          },
          {
            name: 'base'
            type: 'u64'
          },
          {
            name: 'level'
            type: 'u64'
          },
          {
            name: 'bump'
            type: 'u8'
          },
        ]
      }
    },
  ]
}
